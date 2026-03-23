"""
Washington State SB 6346 — Millionaires' Tax reform definition.

Imposes a 9.9% surtax on Washington State residents' income exceeding
$1 million per household, effective January 1, 2028.

Covered income: wages, business income, pass-through distributions,
real property income, and intangible property income connected to
Washington sources. Long-term capital gains are excluded (already
taxed under WA's separate capital gains excise tax).

Note: Washington currently has no state income tax in PolicyEngine, so
this reform is implemented as a manual calculation rather than a
PolicyEngine reform parameter. The tax is approximated as 9.9% on
household adjusted gross income above $1 million for WA residents.
"""

import numpy as np

# Reform parameters
WA_TAX_RATE = 0.099
WA_TAX_THRESHOLD = 1_000_000
EFFECTIVE_YEAR = 2028


def compute_wa_millionaires_tax(agi, state_code, year: int = 2028):
    """
    Compute the WA millionaires' tax for a single household.

    Args:
        agi: Adjusted gross income (scalar).
        state_code: Two-letter state code string.
        year: Tax year.

    Returns:
        Tax amount (0 if below threshold, non-WA, or pre-effective-date).
    """
    if year < EFFECTIVE_YEAR:
        return 0.0
    if state_code != "WA":
        return 0.0
    return max(0.0, agi - WA_TAX_THRESHOLD) * WA_TAX_RATE


def compute_wa_millionaires_tax_array(agi_arr, state_code_arr, year: int = 2028):
    """
    Compute the WA millionaires' tax for arrays of households.

    Args:
        agi_arr: numpy array of AGI values.
        state_code_arr: numpy array or list of state code strings.
        year: Tax year.

    Returns:
        numpy array of tax amounts.
    """
    if year < EFFECTIVE_YEAR:
        return np.zeros(len(agi_arr))
    in_wa = np.array([s == "WA" for s in state_code_arr], dtype=float)
    agi = np.asarray(agi_arr, dtype=float)
    return in_wa * np.maximum(0.0, agi - WA_TAX_THRESHOLD) * WA_TAX_RATE
