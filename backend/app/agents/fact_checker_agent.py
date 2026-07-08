from crewai import Agent, Task
from app.agents.llm_providers import get_factcheck_llm

def get_fact_checker_agent() -> Agent:
    return Agent(
        role="Senior Fact-Checker",
        goal="Cross-check research findings, verify references, and flag unsupported claims or exaggerations.",
        backstory=(
            "You are a meticulous fact-checker who values truth above all. "
            "You scrutinize statements, cross-reference statistics, and verify if links or sources support the claims. "
            "You make sure there are no hallucinated facts or unverified assertions."
        ),
        llm=get_factcheck_llm(),
        max_iter=2,
        allow_delegation=False,
        verbose=True
    )

def get_fact_checker_task(agent: Agent) -> Task:
    return Task(
        description=(
            "Review the compiled findings from the Research Agent. "
            "Scrutinize every claim, data point, and statistic. "
            "Add a validation status next to each major finding indicating whether it is supported or unverified. "
            "Highlight any unsupported or doubtful claims and list corrections if possible."
        ),
        expected_output="A verified findings list specifying supported facts and highlighting flagged or unverified claims.",
        agent=agent
    )
