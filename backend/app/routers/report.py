import asyncio
import json
import uuid
from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.schemas import ReportRequest
from app.events import event_bus
from app.config import settings
from app.crew import get_crew
from app.supabase_client import verify_token, get_supabase_client

limiter = Limiter(key_func=get_remote_address)
security = HTTPBearer()

router = APIRouter(prefix="/api", tags=["report"])

async def get_current_user_and_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> tuple:
    """Verifies the bearer token and returns a tuple of (user_profile_dict, raw_token)."""
    token = credentials.credentials
    try:
        user = verify_token(token)
        return user, token
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

async def simulate_crew_run(task_id: str, topic: str, token: str):
    """Simulates agent pipeline execution and publishes events to the event bus."""
    agents = [
        ("researcher", "Researching web sources for info about " + topic, 3.0),
        ("fact_checker", "Cross-checking claims and validating facts...", 3.0),
        ("writer", "Drafting the structured report sections...", 2.5),
        ("editor", "Polishing tone, formatting, and formatting citations...", 2.0)
    ]
    
    # 1. Starting pipeline
    await event_bus.publish(task_id, {"type": "status", "agent": "researcher", "status": "idle", "detail": "Waiting to start..."})
    await event_bus.publish(task_id, {"type": "status", "agent": "fact_checker", "status": "idle", "detail": "Waiting to start..."})
    await event_bus.publish(task_id, {"type": "status", "agent": "writer", "status": "idle", "detail": "Waiting to start..."})
    await event_bus.publish(task_id, {"type": "status", "agent": "editor", "status": "idle", "detail": "Waiting to start..."})
    await asyncio.sleep(1.0)
    
    for agent_id, detail, duration in agents:
        # Publish 'running' status
        await event_bus.publish(task_id, {
            "type": "status",
            "agent": agent_id,
            "status": "running",
            "detail": detail
        })
        
        # Simulate processing time
        steps = int(duration * 2)
        for i in range(steps):
            await asyncio.sleep(0.5)
            if agent_id == "researcher" and i == 2:
                await event_bus.publish(task_id, {
                    "type": "status",
                    "agent": agent_id,
                    "status": "running",
                    "detail": "Searching Google and Tavily for latest datasets..."
                })
            elif agent_id == "fact_checker" and i == 2:
                await event_bus.publish(task_id, {
                    "type": "status",
                    "agent": agent_id,
                    "status": "running",
                    "detail": "Comparing claims with articles from reliable sources..."
                })
        
        # Publish 'done' status
        await event_bus.publish(task_id, {
            "type": "status",
            "agent": agent_id,
            "status": "done",
            "detail": f"Finished: {detail.split('...')[0]}"
        })
        
        # Simulate incremental content streaming during Writer and Editor
        if agent_id == "writer":
            await event_bus.publish(task_id, {
                "type": "content",
                "content": f"# Research Report: {topic}\n\n## Introduction\nThis is a simulated draft of the research report for **{topic}**.\n\n"
            })
            await asyncio.sleep(0.5)
            await event_bus.publish(task_id, {
                "type": "content",
                "content": "## Background & Analysis\n- Finding 1: Key trend analysis points to high growth.\n- Finding 2: Competitor analysis shows market saturation in secondary fields.\n\n"
            })
        elif agent_id == "editor":
            await event_bus.publish(task_id, {
                "type": "content",
                "content": "## Conclusion & Summary\nIn conclusion, the topic warrants further investigation and structured resource allocation [1].\n\n### References\n[1] Source Link: https://example.com/research-source\n"
            })
            await asyncio.sleep(0.5)

    final_content = (
        f"# Research Report: {topic}\n\n"
        "## Introduction\n"
        f"This is a simulated draft of the research report for **{topic}**.\n\n"
        "## Background & Analysis\n"
        "- Finding 1: Key trend analysis points to high growth.\n"
        "- Finding 2: Competitor analysis shows market saturation in secondary fields.\n\n"
        "## Conclusion & Summary\n"
        "In conclusion, the topic warrants further investigation and structured resource allocation [1].\n\n"
        "### References\n"
        "[1] Source Link: https://example.com/research-source\n"
    )

    try:
        db_client = get_supabase_client(token)
        db_client.table("reports").update({
            "status": "completed",
            "content": final_content
        }).eq("id", task_id).execute()
    except Exception as se:
        print(f"[ERROR] Failed to update completed simulated report in DB: {se}")

    # Complete execution
    await event_bus.publish(task_id, {"type": "complete"})

async def run_real_crew(task_id: str, topic: str, token: str):
    """Executes the CrewAI orchestration and publishes progress events."""
    loop = asyncio.get_running_loop()
    active_agent = ["researcher"]
    
    def research_callback(output):
        active_agent[0] = "fact_checker"
        asyncio.run_coroutine_threadsafe(
            event_bus.publish(task_id, {
                "type": "status",
                "agent": "researcher",
                "status": "done",
                "detail": "Finished researching and compiling sources."
            }), loop
        )
        asyncio.run_coroutine_threadsafe(
            event_bus.publish(task_id, {
                "type": "status",
                "agent": "fact_checker",
                "status": "running",
                "detail": "Cross-checking claims and validating facts..."
            }), loop
        )

    def fact_checker_callback(output):
        active_agent[0] = "writer"
        asyncio.run_coroutine_threadsafe(
            event_bus.publish(task_id, {
                "type": "status",
                "agent": "fact_checker",
                "status": "done",
                "detail": "Finished cross-checking claims."
            }), loop
        )
        asyncio.run_coroutine_threadsafe(
            event_bus.publish(task_id, {
                "type": "status",
                "agent": "writer",
                "status": "running",
                "detail": "Drafting the structured report sections..."
            }), loop
        )

    def writer_callback(output):
        active_agent[0] = "editor"
        asyncio.run_coroutine_threadsafe(
            event_bus.publish(task_id, {
                "type": "status",
                "agent": "writer",
                "status": "done",
                "detail": "Finished writing the initial draft."
            }), loop
        )
        asyncio.run_coroutine_threadsafe(
            event_bus.publish(task_id, {
                "type": "content",
                "content": f"# Research Report: {topic}\n\n## Initial Draft (Raw):\n\n{output.raw_output}\n\n"
            }), loop
        )
        asyncio.run_coroutine_threadsafe(
            event_bus.publish(task_id, {
                "type": "status",
                "agent": "editor",
                "status": "running",
                "detail": "Polishing tone, formatting, and formatting citations..."
            }), loop
        )

    def editor_callback(output):
        asyncio.run_coroutine_threadsafe(
            event_bus.publish(task_id, {
                "type": "status",
                "agent": "editor",
                "status": "done",
                "detail": "Finished polishing and editing report."
            }), loop
        )

    try:
        crew = get_crew(topic)
        
        if len(crew.tasks) >= 4:
            crew.tasks[0].callback = research_callback
            crew.tasks[1].callback = fact_checker_callback
            crew.tasks[2].callback = writer_callback
            crew.tasks[3].callback = editor_callback
            
        await event_bus.publish(task_id, {"type": "status", "agent": "researcher", "status": "running", "detail": f"Researching web sources for: {topic}"})
        await event_bus.publish(task_id, {"type": "status", "agent": "fact_checker", "status": "idle", "detail": "Waiting for research..."})
        await event_bus.publish(task_id, {"type": "status", "agent": "writer", "status": "idle", "detail": "Waiting for fact-check..."})
        await event_bus.publish(task_id, {"type": "status", "agent": "editor", "status": "idle", "detail": "Waiting for writer..."})

        result = await loop.run_in_executor(None, crew.kickoff)
        
        await event_bus.publish(task_id, {
            "type": "content",
            "content": f"\n---\n\n## Final Polished Report:\n\n{result}"
        })

        try:
            db_client = get_supabase_client(token)
            db_client.table("reports").update({
                "status": "completed",
                "content": str(result)
            }).eq("id", task_id).execute()
        except Exception as se:
            print(f"[ERROR] Failed to update completed report in DB: {se}")
        
    except Exception as e:
        await event_bus.publish(task_id, {
            "type": "status",
            "agent": active_agent[0],
            "status": "error",
            "detail": f"Error occurred: {str(e)}"
        })
        
        try:
            db_client = get_supabase_client(token)
            db_client.table("reports").update({
                "status": "failed",
                "content": f"Error occurred: {str(e)}"
            }).eq("id", task_id).execute()
        except Exception as se:
            print(f"[ERROR] Failed to update failed report in DB: {se}")
            
    finally:
        await event_bus.publish(task_id, {"type": "complete"})

@router.post("/report")
@limiter.limit("5/minute")
async def generate_report(req: ReportRequest, request: Request, current_user_and_token: tuple = Depends(get_current_user_and_token)):
    report_id = str(uuid.uuid4())
    event_bus.register(report_id)
    
    current_user, token = current_user_and_token
    
    has_api_keys = bool(settings.GROQ_API_KEY or settings.OPENROUTER_API_KEY or settings.NIM_API_KEY)
    
    # Diagnostic prints to troubleshoot token propagation
    print(f"[DEBUG] verify_token resolved user id: {current_user.get('id')}")
    print(f"[DEBUG] bearer token starts with: {token[:15]}...{token[-15:] if len(token) > 30 else ''}")
    
    db_client = get_supabase_client(token)
    print(f"[DEBUG] db_client postgrest headers: {db_client.postgrest.headers}")
    if db_client.postgrest.session:
        print(f"[DEBUG] db_client session headers: {dict(db_client.postgrest.session.headers)}")
    
    # Insert running report row in Supabase
    try:
        db_client.table("reports").insert({
            "id": report_id,
            "user_id": current_user["id"],
            "topic": req.topic,
            "status": "running",
            "content": ""
        }).execute()
    except Exception as e:
        print(f"[ERROR] Failed to insert running report to Supabase: {e}")
        raise HTTPException(status_code=500, detail="Database write failed")
    
    if not has_api_keys:
        print("[INFO] No API keys configured in .env. Running in SIMULATED mode.")
        asyncio.create_task(simulate_crew_run(report_id, req.topic, token))
    else:
        print("[INFO] API keys detected. Running REAL CrewAI execution.")
        asyncio.create_task(run_real_crew(report_id, req.topic, token))
    
    async def event_generator():
        async for event in event_bus.listen(report_id):
            yield f"data: {json.dumps(event)}\n\n"
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/reports")
async def get_reports(request: Request, current_user_and_token: tuple = Depends(get_current_user_and_token)):
    """Fetches the authenticated user's report generation history."""
    try:
        current_user, token = current_user_and_token
        db_client = get_supabase_client(token)
        
        response = db_client.table("reports")\
            .select("*")\
            .eq("user_id", current_user["id"])\
            .order("created_at", desc=True)\
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch report history: {str(e)}")

@router.delete("/reports/{report_id}")
async def delete_report(report_id: str, request: Request, current_user_and_token: tuple = Depends(get_current_user_and_token)):
    """Deletes a specific report card from history."""
    try:
        current_user, token = current_user_and_token
        db_client = get_supabase_client(token)
        
        db_client.table("reports")\
            .delete()\
            .eq("id", report_id)\
            .eq("user_id", current_user["id"])\
            .execute()
        return {"status": "success", "message": "Report deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete report: {str(e)}")
