from crewai import Agent, Task
from app.agents.llm_providers import get_research_llm
from app.tools.search_tool import web_search

def get_research_agent() -> Agent:
    return Agent(
        role="Lead Researcher",
        goal="Search the web and gather comprehensive, high-quality, and up-to-date data on the topic",
        backstory=(
            "You are an expert researcher with years of experience scraping and indexing deep technical web content. "
            "Your strength lies in finding high-quality articles, whitepapers, academic research, and reliable news. "
            "You extract source URLs, check details diligently, and compile findings clearly."
        ),
        tools=[web_search],
        llm=get_research_llm(),
        max_iter=3,
        allow_delegation=False,
        verbose=True
    )

def get_research_task(agent: Agent, topic: str) -> Task:
    return Task(
        description=(
            f"Conduct thorough web research on the topic: '{topic}'. "
            "Search for key statistics, current industry developments, core concepts, pros/cons, and future trends. "
            "Identify reliable sources and gather their URLs. "
            "Your output must compile all raw facts, insights, and source URLs clearly."
        ),
        expected_output="A compiled raw report containing key facts, figures, descriptions, and list of sources with their URLs.",
        agent=agent
    )
