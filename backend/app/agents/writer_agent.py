from crewai import Agent, Task
from app.agents.llm_providers import get_writer_llm

def get_writer_agent() -> Agent:
    return Agent(
        role="Report Writer",
        goal="Synthesize verified findings into a structured, comprehensive, and highly engaging research report.",
        backstory=(
            "You are a skilled technical writer known for transforming raw data into beautiful, readable, and detailed reports. "
            "You know how to structure documents with logical flow, introduction, clear sections, and conclusion. "
            "You write in an informative and professional tone."
        ),
        llm=get_writer_llm(),
        max_iter=2,
        allow_delegation=False,
        verbose=True
    )

def get_writer_task(agent: Agent) -> Task:
    return Task(
        description=(
            "Take the verified findings list from the Fact-Checker Agent and write a structured draft of the research report. "
            "Organize the report with clear headings, subheadings, and sections. "
            "Draft a strong introduction setting context, a body detailing all the core concepts and findings, and a concise conclusion. "
            "Crucially, incorporate all relevant source URLs and references from the Fact-Checker's findings list directly "
            "into the draft text where they are used, ensuring that no source is lost during drafting."
        ),
        expected_output="A structured draft of the research report with clear headings and inline source references/URLs, in Markdown format.",
        agent=agent
    )
