from crewai import Crew, Process
from app.agents.research_agent import get_research_agent, get_research_task
from app.agents.fact_checker_agent import get_fact_checker_agent, get_fact_checker_task
from app.agents.writer_agent import get_writer_agent, get_writer_task
from app.agents.editor_agent import get_editor_agent, get_editor_task

def get_crew(topic: str) -> Crew:
    """Assembles the agents and tasks into a CrewAI Crew instance."""
    # 1. Initialize agents
    research_agent = get_research_agent()
    fact_checker_agent = get_fact_checker_agent()
    writer_agent = get_writer_agent()
    editor_agent = get_editor_agent()

    # 2. Initialize tasks
    research_task = get_research_task(research_agent, topic)
    fact_checker_task = get_fact_checker_task(fact_checker_agent)
    writer_task = get_writer_task(writer_agent)
    editor_task = get_editor_task(editor_agent)

    # 3. Assemble and return crew
    return Crew(
        agents=[research_agent, fact_checker_agent, writer_agent, editor_agent],
        tasks=[research_task, fact_checker_task, writer_task, editor_task],
        process=Process.sequential,
        verbose=True
    )
