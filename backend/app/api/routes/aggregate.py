import json
import sys
from pathlib import Path
from fastapi import APIRouter

sys.path.insert(0, str(Path(__file__).resolve().parents[4]))

from wa_tax_calc.microsimulation import calculate_aggregate_impact

router = APIRouter()
DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data"


def _aggregate_path(year: int) -> Path:
    return DATA_DIR / f"aggregate_{year}.json"


@router.get("/aggregate")
async def aggregate(year: int = 2028):
    path = _aggregate_path(year)
    if path.exists():
        with open(path) as f:
            return json.load(f)

    result = calculate_aggregate_impact(year=year)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(result, f)
    return result
