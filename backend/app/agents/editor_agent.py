from crewai import Agent, Task
from app.agents.llm_providers import get_editor_llm

def get_editor_agent() -> Agent:
    return Agent(
        role="Copy Editor",
        goal="Polish the report draft for style, formatting, clarity, and ensure citation style matches perfectly.",
        backstory=(
            "You are a master editor who has worked with leading journals and publications. "
            "You correct grammatical slips, adjust the tone for clarity and professionalism, format headers cleanly, "
            "and format references using inline numbered citations pointing to a clean bibliography list at the bottom."
        ),
        llm=get_editor_llm(),
        max_iter=2,
        allow_delegation=False,
        verbose=True
    )

def get_editor_task(agent: Agent) -> Task:
    return Task(
        description=(
            "Polishing the draft report from the Writer Agent. "
            "Standardize formatting, verify readability and flow, correct spelling and grammatical issues. "
            "Crucially, identify all the source URLs and references already included by the Writer Agent in the draft. "
            "Format these existing references using inline numbered citations like [1], [2], and map them to a "
            "bibliography/references list at the bottom of the document. "
            "Do NOT add, fabricate, or invent new citations, Wikipedia links, or external references that were not "
            "already present in the Writer's draft. If a statement does not have an existing source from the "
            "previous steps, leave it uncited rather than creating placeholder or generic links. "
            "Format the final output strictly in clean Markdown."
        ),
        expected_output="The final, polished, and beautifully structured markdown research report with inline citations and a reference list.",
        agent=agent
    )
