"""Aggregate impact for WA millionaires' tax using the WA state dataset."""
import os

import numpy as np

from .reforms import compute_wa_millionaires_tax_array as compute_wa_tax_array

DEFAULT_WA_DATASET = "hf://policyengine/policyengine-us-data/states/WA.h5"
DATASET_ENV_VAR = "WA_MILLIONAIRES_TAX_DATASET"

_INTRA_BOUNDS = [-np.inf, -0.05, -1e-3, 1e-3, 0.05, np.inf]
_INTRA_LABELS = ["Lose more than 5%", "Lose less than 5%", "No change", "Gain less than 5%", "Gain more than 5%"]


def _poverty_metrics(baseline_rate, reform_rate):
    rate_change = reform_rate - baseline_rate
    percent_change = rate_change / baseline_rate * 100 if baseline_rate > 0 else 0.0
    return rate_change, percent_change


def get_wa_dataset_path() -> str:
    return os.environ.get(DATASET_ENV_VAR, DEFAULT_WA_DATASET)


def calculate_aggregate_impact(year: int = 2028, dataset: str | None = None) -> dict:
    from policyengine_us import Microsimulation

    sim = Microsimulation(dataset=dataset or get_wa_dataset_path())

    state_code_arr = np.array(sim.calculate("state_code", period=year, map_to="household"))
    agi_arr = np.array(sim.calculate("adjusted_gross_income", period=year, map_to="household"))
    wa_tax = compute_wa_tax_array(agi_arr, state_code_arr, year)

    household_weight = sim.calculate("household_weight", period=year)
    weight_arr = np.array(household_weight)

    # income_change is negative (tax increase)
    income_change_arr = -wa_tax
    tax_revenue_impact = float((wa_tax * weight_arr).sum())
    total_households = float(weight_arr.sum())

    losers = float(((income_change_arr < -1) * weight_arr).sum())
    winners = 0.0
    beneficiaries = 0.0
    affected_mask = np.abs(income_change_arr) > 1
    affected_w = weight_arr[affected_mask]
    avg_benefit = float(np.average(income_change_arr[affected_mask], weights=affected_w)) if affected_w.sum() > 0 else 0.0
    winners_rate = 0.0
    losers_rate = losers / total_households * 100

    # Decile analysis
    decile_arr = np.array(sim.calculate("household_income_decile", period=year, map_to="household"))
    baseline_net = np.array(sim.calculate("household_net_income", period=year, map_to="household"))
    decile_average, decile_relative = {}, {}
    for d in range(1, 11):
        dmask = decile_arr == d
        d_w = weight_arr[dmask]
        d_count_w = d_w.sum()
        if d_count_w > 0:
            d_change = float((income_change_arr[dmask] * d_w).sum()) / d_count_w
            d_baseline = float((baseline_net[dmask] * d_w).sum())
            decile_average[str(d)] = d_change
            decile_relative[str(d)] = d_change * d_count_w / d_baseline if d_baseline != 0 else 0.0
        else:
            decile_average[str(d)] = 0.0
            decile_relative[str(d)] = 0.0

    people_per_hh = np.array(sim.calculate("household_count_people", period=year, map_to="household"))
    capped_baseline = np.maximum(baseline_net, 1)
    rel_change_arr = income_change_arr / capped_baseline
    people_weighted = people_per_hh * weight_arr
    intra_decile_deciles = {label: [] for label in _INTRA_LABELS}
    for d in range(1, 11):
        dmask = decile_arr == d
        d_people = people_weighted[dmask]
        d_total = d_people.sum()
        d_rel = rel_change_arr[dmask]
        for lower, upper, label in zip(_INTRA_BOUNDS[:-1], _INTRA_BOUNDS[1:], _INTRA_LABELS):
            in_group = (d_rel > lower) & (d_rel <= upper)
            proportion = float(d_people[in_group].sum() / d_total) if d_total > 0 else 0.0
            intra_decile_deciles[label].append(proportion)
    intra_decile_all = {label: sum(intra_decile_deciles[label]) / 10 for label in _INTRA_LABELS}

    # Poverty (unchanged by this reform — affects only very high earners)
    pov_bl = sim.calculate("in_poverty", period=year, map_to="person")
    poverty_baseline_rate = float(np.array(pov_bl).mean() * 100)

    age_arr = np.array(sim.calculate("age", period=year))
    pw_arr = np.array(sim.calculate("person_weight", period=year))
    is_child = age_arr < 18
    child_w = pw_arr[is_child]
    total_child_w = child_w.sum()
    pov_bl_arr = np.array(pov_bl).astype(bool)
    child_poverty_baseline_rate = float((pov_bl_arr[is_child] * child_w).sum() / total_child_w * 100) if total_child_w > 0 else 0.0

    # By income bracket
    income_brackets = [
        (0, 200_000, "Under $200k"),
        (200_000, 500_000, "$200k-$500k"),
        (500_000, 1_000_000, "$500k-$1M"),
        (1_000_000, 2_000_000, "$1M-$2M"),
        (2_000_000, 5_000_000, "$2M-$5M"),
        (5_000_000, float("inf"), "Over $5M"),
    ]
    by_income_bracket = []
    for min_inc, max_inc, label in income_brackets:
        mask = (agi_arr >= min_inc) & (agi_arr < max_inc) & affected_mask
        b_affected = float(weight_arr[mask].sum())
        if b_affected > 0:
            b_cost = float((income_change_arr[mask] * weight_arr[mask]).sum())
            b_avg = float(np.average(income_change_arr[mask], weights=weight_arr[mask]))
        else:
            b_cost = 0.0
            b_avg = 0.0
        by_income_bracket.append({"bracket": label, "beneficiaries": b_affected, "total_cost": b_cost, "avg_benefit": b_avg})

    return {
        "budget": {"budgetary_impact": tax_revenue_impact, "tax_revenue_impact": tax_revenue_impact, "benefit_spending_impact": 0.0, "households": total_households},
        "decile": {"average": decile_average, "relative": decile_relative},
        "intra_decile": {"all": intra_decile_all, "deciles": intra_decile_deciles},
        "total_cost": -tax_revenue_impact,
        "beneficiaries": beneficiaries,
        "avg_benefit": avg_benefit,
        "winners": winners,
        "losers": losers,
        "winners_rate": winners_rate,
        "losers_rate": losers_rate,
        "poverty_baseline_rate": poverty_baseline_rate,
        "poverty_reform_rate": poverty_baseline_rate,
        "poverty_rate_change": 0.0,
        "poverty_percent_change": 0.0,
        "child_poverty_baseline_rate": child_poverty_baseline_rate,
        "child_poverty_reform_rate": child_poverty_baseline_rate,
        "child_poverty_rate_change": 0.0,
        "child_poverty_percent_change": 0.0,
        "deep_poverty_baseline_rate": 0.0,
        "deep_poverty_reform_rate": 0.0,
        "deep_poverty_rate_change": 0.0,
        "deep_poverty_percent_change": 0.0,
        "deep_child_poverty_baseline_rate": 0.0,
        "deep_child_poverty_reform_rate": 0.0,
        "deep_child_poverty_rate_change": 0.0,
        "deep_child_poverty_percent_change": 0.0,
        "by_income_bracket": by_income_bracket,
    }
