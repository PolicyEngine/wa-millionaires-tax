"""Basic sanity tests for WA millionaires' tax reform."""
import pytest
from wa_tax_calc.reforms import compute_wa_millionaires_tax_array as compute_wa_tax_array, WA_TAX_RATE, WA_TAX_THRESHOLD, EFFECTIVE_YEAR
import numpy as np


def test_below_threshold_no_tax():
    result = compute_wa_tax_array([500_000], ["WA"], year=2028)
    assert result[0] == 0.0


def test_above_threshold_taxed():
    agi = 2_000_000
    expected = (agi - WA_TAX_THRESHOLD) * WA_TAX_RATE
    result = compute_wa_tax_array([agi], ["WA"], year=2028)
    assert abs(result[0] - expected) < 1.0


def test_non_wa_no_tax():
    result = compute_wa_tax_array([5_000_000], ["CA"], year=2028)
    assert result[0] == 0.0


def test_pre_effective_no_tax():
    result = compute_wa_tax_array([5_000_000], ["WA"], year=2027)
    assert result[0] == 0.0


def test_at_threshold_no_tax():
    result = compute_wa_tax_array([1_000_000], ["WA"], year=2028)
    assert result[0] == 0.0
