import asyncio
import json
import uuid
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.schemas import ReportRequest
from app.events import event_bus
from app.config import settings
from app.crew import get_crew

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/api", tags=["report"])

async def simulate_crew_run(task_id: str, topic: str):
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

    # Complete execution
    await event_bus.publish(task_id, {"type": "complete"})

async def run_real_crew(task_id: str, topic: str):
    """Executes the CrewAI orchestration and publishes progress events."""
    loop = asyncio.get_running_loop()
    
    # Track the active agent to correctly map errors in the UI
    active_agent = ["researcher"]
    
    # Define callbacks to publish status updates from synchronous CrewAI threads
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
        # Stream the raw draft report content
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
        # 1. Build crew
        crew = get_crew(topic)
        
        # 2. Assign callbacks
        if len(crew.tasks) >= 4:
            crew.tasks[0].callback = research_callback
            crew.tasks[1].callback = fact_checker_callback
            crew.tasks[2].callback = writer_callback
            crew.tasks[3].callback = editor_callback
            
        # 3. Publish initial statuses
        await event_bus.publish(task_id, {"type": "status", "agent": "researcher", "status": "running", "detail": f"Researching web sources for: {topic}"})
        await event_bus.publish(task_id, {"type": "status", "agent": "fact_checker", "status": "idle", "detail": "Waiting for research..."})
        await event_bus.publish(task_id, {"type": "status", "agent": "writer", "status": "idle", "detail": "Waiting for fact-check..."})
        await event_bus.publish(task_id, {"type": "status", "agent": "editor", "status": "idle", "detail": "Waiting for writer..."})

        # 4. Run the crew in a separate thread to keep FastAPI responsive
        result = await loop.run_in_executor(None, crew.kickoff)
        
        # 5. Stream final polished content
        await event_bus.publish(task_id, {
            "type": "content",
            "content": f"\n---\n\n## Final Polished Report:\n\n{result}"
        })
        
    except Exception as e:
        # Publish error state to active agent node
        await event_bus.publish(task_id, {
            "type": "status",
            "agent": active_agent[0],
            "status": "error",
            "detail": f"Error occurred: {str(e)}"
        })
    finally:
        # 6. Complete execution
        await event_bus.publish(task_id, {"type": "complete"})

@router.post("/report")
@limiter.limit("5/minute")
async def generate_report(req: ReportRequest, request: Request):
    task_id = str(uuid.uuid4())
    
    # Register the queue first so events are not lost in the race condition
    event_bus.register(task_id)
    
    # Fallback to simulation if keys are not set
    has_api_keys = bool(settings.GROQ_API_KEY or settings.OPENROUTER_API_KEY or settings.NIM_API_KEY)
    
    if not has_api_keys:
        print("[INFO] No API keys configured in .env. Running in SIMULATED mode.")
        asyncio.create_task(simulate_crew_run(task_id, req.topic))
    else:
        print("[INFO] API keys detected. Running REAL CrewAI execution.")
        asyncio.create_task(run_real_crew(task_id, req.topic))
    
    async def event_generator():
        async for event in event_bus.listen(task_id):
            yield f"data: {json.dumps(event)}\n\n"
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")
