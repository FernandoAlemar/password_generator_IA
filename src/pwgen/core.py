"""Geração de senhas com RNG injetável (testes) ou secrets/SystemRandom (produção)."""

from __future__ import annotations

import random
import secrets
import string
from collections.abc import Callable, Sequence

from pwgen.policy import GenerationParams, validate

LOWERCASE = string.ascii_lowercase
UPPERCASE = string.ascii_uppercase
DIGITS = string.digits
SYMBOLS = "!@#$%&*_-+=?"


def _charset_for_flag(params: GenerationParams) -> list[str]:
    sets: list[str] = []
    if params.use_lower:
        sets.append(LOWERCASE)
    if params.use_upper:
        sets.append(UPPERCASE)
    if params.use_digits:
        sets.append(DIGITS)
    if params.use_symbols:
        sets.append(SYMBOLS)
    return sets


def _pool_from_sets(sets: Sequence[str]) -> str:
    return "".join(sets)


def _fill_password_chars(
    params: GenerationParams,
    sets: list[str],
    pool: str,
    choice: Callable[[str], str],
) -> list[str]:
    chars: list[str] = []
    if params.require_each:
        for s in sets:
            chars.append(choice(s))
        remaining = params.length - len(chars)
        for _ in range(remaining):
            chars.append(choice(pool))
    else:
        for _ in range(params.length):
            chars.append(choice(pool))
    return chars


def generate_password(
    params: GenerationParams,
    *,
    rng: random.Random | None = None,
) -> str:
    validate(params)
    sets = _charset_for_flag(params)
    pool = _pool_from_sets(sets)

    if rng is not None:
        chars = _fill_password_chars(params, sets, pool, rng.choice)
        rng.shuffle(chars)
        return "".join(chars)

    chars = _fill_password_chars(params, sets, pool, secrets.choice)
    random.SystemRandom().shuffle(chars)
    return "".join(chars)


def generate_passwords(
    params: GenerationParams,
    count: int,
    *,
    rng: random.Random | None = None,
) -> list[str]:
    if count < 1:
        raise ValueError("count deve ser >= 1.")
    return [generate_password(params, rng=rng) for _ in range(count)]
