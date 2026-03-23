from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str
    version: str

class BenefitAtIncome(BaseModel):
    baseline: float
    reform: float
    difference: float

class HouseholdImpactResponse(BaseModel):
    income_range: list[float]
    net_income_change: list[float]
    benefit_at_income: BenefitAtIncome
    x_axis_max: float
