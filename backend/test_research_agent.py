import sys
import os
from dotenv import load_dotenv

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from crewai import Crew, Process
from app.agents.research_agent import get_research_agent, get_research_task

def run_test():
    print("Testing Research Agent standalone...")
    agent = get_research_agent()
    task = get_research_task(agent, "Impact of AI on Healthcare")
    
    crew = Crew(
        agents=[agent],
        tasks=[task],
        process=Process.sequential,
        verbose=True
    )
    
    result = crew.kickoff()
    print("\n--- STANDALONE RESEARCH RESULTS ---")
    print(result)

if __name__ == "__main__":
    run_test()
