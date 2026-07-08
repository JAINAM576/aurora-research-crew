from pydantic import BaseModel, Field

class ReportRequest(BaseModel):
    topic: str = Field(..., min_length=3, max_length=200, description="The topic to research and generate a report on.")
