"""Household impact calculation for WA millionaires' tax."""
from .reforms import compute_wa_millionaires_tax_array as compute_wa_tax_array

_GROUP_UNITS = ["families", "spm_units", "tax_units", "households"]


def _add_member(situation, member_id):
    for unit in _GROUP_UNITS:
        key = next(iter(situation[unit]))
        situation[unit][key]["members"].append(member_id)


def build_household_situation(age_head, age_spouse, dependent_ages, year=2028, with_axes=False, max_earnings=3_000_000, state_code="WA"):
    situation = {
        "people": {"you": {"age": {year: age_head}}},
        "families": {"your family": {"members": ["you"]}},
        "marital_units": {"your marital unit": {"members": ["you"]}},
        "spm_units": {"your household": {"members": ["you"]}},
        "tax_units": {"your tax unit": {"members": ["you"]}},
        "households": {"your household": {"members": ["you"], "state_code": {year: state_code}}},
    }
    if with_axes:
        situation["axes"] = [[{"name": "employment_income", "min": 0, "max": max_earnings, "count": min(4_001, max(501, max_earnings // 1_000)), "period": year}]]
    if age_spouse is not None:
        situation["people"]["your partner"] = {"age": {year: age_spouse}}
        _add_member(situation, "your partner")
        situation["marital_units"]["your marital unit"]["members"].append("your partner")
    for i, dep_age in enumerate(dependent_ages):
        child_id = "your first dependent" if i == 0 else "your second dependent" if i == 1 else f"dependent_{i+1}"
        situation["people"][child_id] = {"age": {year: dep_age}}
        _add_member(situation, child_id)
        situation["marital_units"][f"{child_id}'s marital unit"] = {"members": [child_id]}
    return situation


def calculate_household_impact(params: dict) -> dict:
    from policyengine_us import Simulation
    import numpy as np

    year = params.get("year", 2028)
    state_code = params.get("state_code", "WA")
    situation = build_household_situation(
        age_head=params["age_head"],
        age_spouse=params.get("age_spouse"),
        dependent_ages=params.get("dependent_ages", []),
        year=year, with_axes=True,
        max_earnings=int(params.get("max_earnings", 3_000_000)),
        state_code=state_code,
    )
    sim = Simulation(situation=situation)
    net_bl = sim.calculate("household_net_income", period=year)
    agi_range = sim.calculate("adjusted_gross_income", period=year, map_to="household")
    wa_tax = compute_wa_tax_array(agi_range, [state_code] * len(agi_range), year)
    diff = -wa_tax
    income = params.get("income", 500_000)
    idx = int((abs(np.asarray(agi_range) - income)).argmin())
    return {
        "income_range": list(agi_range),
        "net_income_change": list(diff),
        "benefit_at_income": {"baseline": float(net_bl[idx]), "reform": float(net_bl[idx] + diff[idx]), "difference": float(diff[idx])},
        "x_axis_max": int(params.get("max_earnings", 3_000_000)),
    }
