"""Subprocess worker — runs one year in isolated process. Usage: python scripts/_pipeline_worker.py <year>"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def _convert(obj):
    import numpy as np
    if isinstance(obj, (np.integer,)): return int(obj)
    if isinstance(obj, (np.floating,)): return float(obj)
    if isinstance(obj, np.ndarray): return obj.tolist()
    if isinstance(obj, dict): return {k: _convert(v) for k, v in obj.items()}
    if isinstance(obj, list): return [_convert(v) for v in obj]
    return obj

year = int(sys.argv[1])
from wa_tax_calc.microsimulation import calculate_aggregate_impact
print(f"  Computing {year}...", file=sys.stderr)
result = calculate_aggregate_impact(year=year)
json.dump(_convert(result), sys.stdout)
