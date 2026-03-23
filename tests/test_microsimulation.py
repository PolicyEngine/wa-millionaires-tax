from wa_tax_calc.microsimulation import (
    DATASET_ENV_VAR,
    DEFAULT_WA_DATASET,
    get_wa_dataset_path,
)


def test_get_wa_dataset_path_defaults_to_hf_state_dataset(monkeypatch):
    monkeypatch.delenv(DATASET_ENV_VAR, raising=False)

    assert get_wa_dataset_path() == DEFAULT_WA_DATASET


def test_get_wa_dataset_path_respects_override(monkeypatch):
    custom_path = "/tmp/WA.h5"
    monkeypatch.setenv(DATASET_ENV_VAR, custom_path)

    assert get_wa_dataset_path() == custom_path
