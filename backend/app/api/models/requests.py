from pydantic import BaseModel

class HouseholdRequest(BaseModel):
    age_head: int
    age_spouse: int | None = None
    dependent_ages: list[int] = []
    income: float
    year: int = 2028
    max_earnings: float = 3_000_000
    state_code: str = "WA"
