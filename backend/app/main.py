import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.routers import report

# Initialize slowapi rate limiter
limiter = Limiter(key_func=get_remote_address)




app = FastAPI(
    title="Multi-Agent Research & Report Writer API",
    description="Backend service orchestrating CrewAI research agents with SSE updates",
    version="1.0.0"
)

# Wire rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(report.router)

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "Multi-Agent Research & Report Writer API",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
