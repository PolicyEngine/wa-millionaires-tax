from fastapi import APIRouter
from app.api.models.requests import HouseholdRequest
from app.api.models.responses import HouseholdImpactResponse
from app.services.calculator import calculate_household_impact

router = APIRouter()

@router.post("/household-impact", response_model=HouseholdImpactResponse)
async def household_impact(request: HouseholdRequest):
    return calculate_household_impact(request.model_dump())
