import sys
from types import SimpleNamespace

import numpy as np

import wa_tax_calc.microsimulation as microsimulation
from wa_tax_calc.microsimulation import (
    DATASET_ENV_VAR,
    DEFAULT_WA_DATASET,
    get_wa_dataset_path,
)


class WeightedSeries:
    def __init__(self, values, weights):
        self.values = np.array(values)
        self.weights = np.array(weights)

    def __array__(self, dtype=None, copy=None):
        return np.asarray(self.values, dtype=dtype)

    def mean(self):
        return np.average(self.values, weights=self.weights)


class FakeMicrosimulation:
    def __init__(self, dataset):
        self.dataset = dataset

    def calculate(self, variable, period, map_to=None):
        values = {
            "state_code": [53, 53],
            "adjusted_gross_income": [0, 0],
            "household_weight": [1, 1],
            "household_income_decile": [1, 2],
            "household_net_income": [1, 1],
            "household_count_people": [1, 1],
            "in_poverty": WeightedSeries([0, 1], weights=[9, 1]),
            "age": [30, 30],
            "person_weight": [9, 1],
        }
        return values[variable]


def test_get_wa_dataset_path_defaults_to_hf_state_dataset(monkeypatch):
    monkeypatch.delenv(DATASET_ENV_VAR, raising=False)

    assert get_wa_dataset_path() == DEFAULT_WA_DATASET


def test_get_wa_dataset_path_respects_override(monkeypatch):
    custom_path = "/tmp/WA.h5"
    monkeypatch.setenv(DATASET_ENV_VAR, custom_path)

    assert get_wa_dataset_path() == custom_path


def test_calculate_aggregate_impact_uses_person_weights_for_poverty(monkeypatch):
    monkeypatch.setitem(
        sys.modules,
        "policyengine_us",
        SimpleNamespace(Microsimulation=FakeMicrosimulation),
    )
    monkeypatch.setattr(
        microsimulation,
        "compute_wa_tax_array",
        lambda agi, state_code, year: np.zeros_like(agi),
    )

    result = microsimulation.calculate_aggregate_impact(dataset="test.h5")

    assert result["poverty_baseline_rate"] == 10.0
    assert result["poverty_reform_rate"] == 10.0
