"""Data generation pipeline for WA millionaires' tax calculator.

Usage:
    python scripts/pipeline.py           # Resume from where you left off
    python scripts/pipeline.py --fresh   # Start from scratch
"""
import gc, json, os, subprocess, sys
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

DEFAULT_OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "public", "data")
YEARS = list(range(2028, 2036))
CSV_FILES = ["distributional_impact", "metrics", "winners_losers", "income_brackets"]


def _save_csv(df, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    df.to_csv(path, index=False)


def _load_existing(output_dir):
    existing = {}
    for name in CSV_FILES:
        path = os.path.join(output_dir, f"{name}.csv")
        existing[name] = pd.read_csv(path) if os.path.exists(path) else pd.DataFrame()
    return existing


def _completed_years(existing):
    if existing["metrics"].empty:
        return set()
    return set(existing["metrics"]["year"].unique()) & set(YEARS)


def _run_year(year):
    worker = os.path.join(os.path.dirname(__file__), "_pipeline_worker.py")
    proc = subprocess.run([sys.executable, "-u", worker, str(year)], capture_output=False, stderr=None, stdout=subprocess.PIPE, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"Worker failed for year {year}")
    return json.loads(proc.stdout)


def _extract_distributional(result, year):
    return [{"year": year, "decile": d, "average_change": round(v, 2), "relative_change": round(result["decile"]["relative"][d], 6)} for d, v in result["decile"]["average"].items()]


def _extract_metrics(result, year):
    keys = ["budgetary_impact", "tax_revenue_impact", "benefit_spending_impact", "households", "total_cost", "beneficiaries", "avg_benefit", "winners", "losers", "winners_rate", "losers_rate", "poverty_baseline_rate", "poverty_reform_rate", "poverty_rate_change", "poverty_percent_change", "child_poverty_baseline_rate", "child_poverty_reform_rate", "child_poverty_rate_change", "child_poverty_percent_change", "deep_poverty_baseline_rate", "deep_poverty_reform_rate", "deep_poverty_rate_change", "deep_poverty_percent_change", "deep_child_poverty_baseline_rate", "deep_child_poverty_reform_rate", "deep_child_poverty_rate_change", "deep_child_poverty_percent_change"]
    budget_keys = {"budgetary_impact", "tax_revenue_impact", "benefit_spending_impact", "households"}
    rows = []
    for k in keys:
        v = result["budget"][k] if k in budget_keys else result.get(k, 0)
        rows.append({"year": year, "metric": k, "value": v})
    return rows


def _extract_winners_losers(result, year):
    intra = result["intra_decile"]
    label_map = {"Gain more than 5%": "gain_more_5pct", "Gain less than 5%": "gain_less_5pct", "No change": "no_change", "Lose less than 5%": "lose_less_5pct", "Lose more than 5%": "lose_more_5pct"}
    rows = [{"year": year, "decile": "All", **{v: intra["all"][k] for k, v in label_map.items()}}]
    for i in range(10):
        rows.append({"year": year, "decile": str(i+1), **{v: intra["deciles"][k][i] for k, v in label_map.items()}})
    return rows


def _extract_income_brackets(result, year):
    return [{"year": year, "bracket": b["bracket"], "beneficiaries": b["beneficiaries"], "total_cost": b["total_cost"], "avg_benefit": b["avg_benefit"]} for b in result["by_income_bracket"]]


def generate_all_data(output_dir=None, fresh=False):
    output_dir = output_dir or DEFAULT_OUTPUT_DIR
    existing = {name: pd.DataFrame() for name in CSV_FILES} if fresh else _load_existing(output_dir)
    done = set() if fresh else _completed_years(existing)
    remaining = [y for y in YEARS if y not in done]
    if not remaining:
        print("All years already computed. Use --fresh to regenerate.")
        return existing
    print(f"Years to compute: {remaining}")
    for i, year in enumerate(remaining):
        print(f"\n[{i+1}/{len(remaining)}] Year {year}...")
        result = _run_year(year)
        new_rows = {
            "distributional_impact": _extract_distributional(result, year),
            "metrics": _extract_metrics(result, year),
            "winners_losers": _extract_winners_losers(result, year),
            "income_brackets": _extract_income_brackets(result, year),
        }
        for name, rows in new_rows.items():
            df = pd.DataFrame(rows)
            existing[name] = df if existing[name].empty else pd.concat([existing[name], df], ignore_index=True)
            _save_csv(existing[name], os.path.join(output_dir, f"{name}.csv"))
        print(f"  Year {year} complete.")
    return existing


if __name__ == "__main__":
    generate_all_data(fresh="--fresh" in sys.argv)
