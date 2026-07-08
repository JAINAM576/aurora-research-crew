import sys
import os
from dotenv import load_dotenv

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from app.crew import get_crew

def run_test():
    print("Testing Full Crew standalone sequentially...")
    crew = get_crew("Impact of AI on Healthcare")
    result = crew.kickoff()
    print("\n--- STANDALONE FULL CREW RESULTS ---")
    print(result)

if __name__ == "__main__":
    run_test()
