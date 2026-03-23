# Washington State Millionaires' Tax Calculator

Interactive calculator for estimating the impact of Washington State SB 6346, the "Millionaires' Tax."

**Live site:** (TBD)

## About the reform

SB 6346 imposes a 9.9% surtax on Washington State residents' income exceeding $1 million per household. It applies to wages, business income, pass-through entity income, and real property income derived from Washington sources. Long-term capital gains are excluded (already subject to WA's separate capital gains excise tax). The tax takes effect January 1, 2028.

**Note on modeling**: Washington currently has no state income tax, so this reform is computed as a manual calculation on top of PolicyEngine's baseline simulation rather than via a PolicyEngine reform parameter. The tax is approximated as 9.9% on household AGI above $1 million for WA residents.

Aggregate analysis uses the Washington state-calibrated dataset at `hf://policyengine/policyengine-us-data/states/WA.h5`, matching the state H5 pattern used in PolicyEngine US Data. To point the pipeline at a staging or local H5 instead, set `WA_MILLIONAIRES_TAX_DATASET`.

## Structure

- **frontend/** — Next.js 14 dashboard (Tailwind, React Query, Recharts)
- **backend/** — FastAPI household calculator
- **wa_tax_calc/** — Core Python calculation logic (microsimulation, household, reform)
- **scripts/** — Data pipeline for precomputed CSV results

## Getting started

### Frontend

```bash
cd frontend
npm install
npm run dev    # runs on http://localhost:3009
```

### Backend

```bash
cd backend
uv venv
uv pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Generate precomputed data

```bash
python scripts/pipeline.py      # CSVs for WA impact tab
```

## Status

Reform parameters set: 9.9% rate on income > $1M for WA residents, effective 2028.
