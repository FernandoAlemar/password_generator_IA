"""Testes do núcleo de geração."""

from __future__ import annotations

import random

import pytest
from hypothesis import given, settings
from hypothesis import strategies as st

from pwgen.core import (
    DIGITS,
    LOWERCASE,
    SYMBOLS,
    UPPERCASE,
    generate_password,
    generate_passwords,
)
from pwgen.policy import MAX_LENGTH, MIN_LENGTH, GenerationParams, PolicyError


def _params(
    length: int,
    *,
    lower: bool = True,
    upper: bool = True,
    digits: bool = True,
    symbols: bool = True,
    require_each: bool = False,
) -> GenerationParams:
    return GenerationParams(
        length=length,
        use_lower=lower,
        use_upper=upper,
        use_digits=digits,
        use_symbols=symbols,
        require_each=require_each,
    )


def test_generate_password_length() -> None:
    rng = random.Random(42)
    p = _params(20, require_each=False)
    s = generate_password(p, rng=rng)
    assert len(s) == 20


def test_require_each_contains_each_set() -> None:
    rng = random.Random(0)
    p = _params(12, require_each=True)
    s = generate_password(p, rng=rng)
    assert any(c in LOWERCASE for c in s)
    assert any(c in UPPERCASE for c in s)
    assert any(c in DIGITS for c in s)
    assert any(c in SYMBOLS for c in s)


def test_only_lowercase_no_other_sets() -> None:
    rng = random.Random(123)
    p = _params(24, upper=False, digits=False, symbols=False, require_each=False)
    s = generate_password(p, rng=rng)
    assert len(s) == 24
    assert set(s) <= set(LOWERCASE)


def test_generate_passwords_count() -> None:
    rng = random.Random(7)
    p = _params(10)
    out = generate_passwords(p, 5, rng=rng)
    assert len(out) == 5
    assert all(len(x) == 10 for x in out)


def test_generate_passwords_rejects_zero_count() -> None:
    p = _params(10)
    with pytest.raises(ValueError, match="count"):
        generate_passwords(p, 0)


def test_policy_error_propagates_from_generate() -> None:
    p = _params(4, upper=False, digits=False, symbols=False, require_each=True)
    with pytest.raises(PolicyError):
        generate_password(p, rng=random.Random(1))


# --- Hypothesis ---


def _charset_for_params(p: GenerationParams) -> str:
    parts: list[str] = []
    if p.use_lower:
        parts.append(LOWERCASE)
    if p.use_upper:
        parts.append(UPPERCASE)
    if p.use_digits:
        parts.append(DIGITS)
    if p.use_symbols:
        parts.append(SYMBOLS)
    return "".join(parts)


@settings(max_examples=80)
@given(
    length=st.integers(min_value=MIN_LENGTH, max_value=MAX_LENGTH),
    seed=st.integers(min_value=0, max_value=2**31 - 1),
    use_lower=st.booleans(),
    use_upper=st.booleans(),
    use_digits=st.booleans(),
    use_symbols=st.booleans(),
    require_each=st.booleans(),
)
def test_hypothesis_length_and_charset_invariants(
    length: int,
    seed: int,
    use_lower: bool,
    use_upper: bool,
    use_digits: bool,
    use_symbols: bool,
    require_each: bool,
) -> None:
    selected = sum((use_lower, use_upper, use_digits, use_symbols))
    if selected == 0:
        return
    if require_each and length < selected:
        return

    p = GenerationParams(
        length=length,
        use_lower=use_lower,
        use_upper=use_upper,
        use_digits=use_digits,
        use_symbols=use_symbols,
        require_each=require_each,
    )
    allowed = _charset_for_params(p)
    rng = random.Random(seed)
    s = generate_password(p, rng=rng)
    assert len(s) == length
    assert all(c in allowed for c in s)
    if require_each:
        if use_lower:
            assert any(c in LOWERCASE for c in s)
        if use_upper:
            assert any(c in UPPERCASE for c in s)
        if use_digits:
            assert any(c in DIGITS for c in s)
        if use_symbols:
            assert any(c in SYMBOLS for c in s)
    if not use_lower:
        assert not any(c in LOWERCASE for c in s)
    if not use_upper:
        assert not any(c in UPPERCASE for c in s)
    if not use_digits:
        assert not any(c in DIGITS for c in s)
    if not use_symbols:
        assert not any(c in SYMBOLS for c in s)


@settings(max_examples=50)
@given(
    length=st.integers(min_value=MIN_LENGTH, max_value=24),
    seed=st.integers(min_value=0, max_value=9999),
)
def test_hypothesis_many_passwords_usually_distinct(length: int, seed: int) -> None:
    p = _params(length)
    rng = random.Random(seed)
    out = generate_passwords(p, 100, rng=rng)
    assert len(set(out)) >= 95
