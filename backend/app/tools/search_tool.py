import httpx
from typing import Any
from langchain_core.tools import Tool
from app.config import settings

def execute_search(query: str) -> str:
    """
    Search the web for up-to-date information, facts, and sources on a specific query.
    Returns a formatted string of the top search results including titles, snippets, and source URLs.
    """
    api_key = settings.TAVILY_API_KEY
    
    if not api_key:
        print("[WARNING] TAVILY_API_KEY is not set. Returning simulated search results.")
        return (
            f"Simulated Search Results for query: '{query}'\n\n"
            f"1. Quantum Computing Overview\n"
            f"   Snippet: Quantum computing utilizes superposition and entanglement to perform complex operations.\n"
            f"   Source: https://wikipedia.org/wiki/Quantum_computing\n\n"
            f"2. Post-Quantum Cryptography Developments\n"
            f"   Snippet: NIST has announced standard post-quantum cryptographic algorithms to replace RSA.\n"
            f"   Source: https://nist.gov/post-quantum-cryptography\n\n"
            f"3. Industry trends in 2026\n"
            f"   Snippet: Global investment in quantum technologies has risen by 35% year-over-year.\n"
            f"   Source: https://quantum-industry-report.com\n"
        )

    try:
        url = "https://api.tavily.com/search"
        payload = {
            "api_key": api_key,
            "query": query,
            "max_results": 2,
            "search_depth": "basic"
        }
        
        response = httpx.post(url, json=payload, timeout=15.0)
        
        if response.status_code == 200:
            data = response.json()
            results = data.get("results", [])
            
            if not results:
                return f"No search results found for query: '{query}'."
                
            formatted_results = []
            for i, res in enumerate(results, 1):
                title = res.get("title", "No Title")
                url_src = res.get("url", "No URL")
                content = res.get("content", "No Content")
                
                formatted_results.append(
                    f"{i}. Title: {title}\n"
                    f"   Source: {url_src}\n"
                    f"   Snippet: {content}\n"
                )
            return "\n".join(formatted_results)
        else:
            return f"Tavily search API returned status code {response.status_code}: {response.text}"
            
    except Exception as e:
        return f"Error executing web search: {str(e)}"

# Subclass Tool to override _run. This absorbs and ignores any config/RunnableConfig arguments 
# that cause signature mismatch TypeErrors in CrewAI v0.36.0 / LangChain compatibility layers.
class CrewCompatibleTool(Tool):
    def _run(self, *args: Any, **kwargs: Any) -> Any:
        query = args[0] if args else kwargs.get("query", "")
        # Force string type for the query input
        if isinstance(query, dict) and "query" in query:
            query = query["query"]
        return self.func(str(query))

web_search = CrewCompatibleTool(
    name="Web Search Tool",
    description="Search the web for up-to-date information, facts, and sources on a specific query. The input should be a simple search query string.",
    func=execute_search
)
