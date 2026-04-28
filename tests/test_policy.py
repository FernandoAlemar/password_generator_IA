"""Testes de validação de política."""

import pytest

import pwgen.policy as policy
from pwgen.policy import MAX_LENGTH, MIN_LENGTH, GenerationParams, PolicyError, validate


def test_validate_accepts_defaults() -> None:
    p = GenerationParams(
        length=16,
        use_lower=True,
        use_upper=True,
        use_digits=True,
        use_symbols=True,
        require_each=False,
    )
    validate(p)


def test_validate_rejects_length_too_short() -> None:
    p = GenerationParams(
        length=MIN_LENGTH - 1,
        use_lower=True,
        use_upper=False,
        use_digits=False,
        use_symbols=False,
        require_each=False,
    )
    with pytest.raises(PolicyError, match="Comprimento"):
        validate(p)


def test_validate_rejects_length_too_long() -> None:
    p = GenerationParams(
        length=MAX_LENGTH + 1,
        use_lower=True,
        use_upper=False,
        use_digits=False,
        use_symbols=False,
        require_each=False,
    )
    with pytest.raises(PolicyError, match="Comprimento"):
        validate(p)


def test_validate_rejects_no_charset() -> None:
    p = GenerationParams(
        length=16,
        use_lower=False,
        use_upper=False,
        use_digits=False,
        use_symbols=False,
        require_each=False,
    )
    with pytest.raises(PolicyError, match="ao menos um conjunto"):
        validate(p)


def test_validate_require_each_length_vs_sets(monkeypatch: pytest.MonkeyPatch) -> None:
    """Com MIN_LENGTH padrão (8), length >= conjuntos sempre; isola a regra com MIN_LENGTH baixo."""
    monkeypatch.setattr(policy, "MIN_LENGTH", 1)
    p = GenerationParams(
        length=2,
        use_lower=True,
        use_upper=True,
        use_digits=True,
        use_symbols=False,
        require_each=True,
    )
    with pytest.raises(PolicyError, match="política mínima"):
        validate(p)


def test_validate_require_each_ok_when_length_sufficient(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(policy, "MIN_LENGTH", 1)
    p = GenerationParams(
        length=4,
        use_lower=True,
        use_upper=True,
        use_digits=True,
        use_symbols=False,
        require_each=True,
    )
    validate(p)
