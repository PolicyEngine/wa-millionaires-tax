from fastapi import APIRouter
from app.api.models.responses import HealthResponse

router = APIRouter()

@router.get("/health")
async def health() -> HealthResponse:
    return HealthResponse(status="ok", version="0.1.0")
