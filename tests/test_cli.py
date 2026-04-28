"""Testes da CLI."""

from __future__ import annotations

import sys

import pytest

from pwgen.cli import main


def test_cli_help(monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]) -> None:
    monkeypatch.setattr(sys, "argv", ["gerar-senha", "--help"])
    with pytest.raises(SystemExit) as exc:
        main()
    assert exc.value.code == 0
    captured = capsys.readouterr()
    assert "--length" in captured.out


def test_cli_validation_exit_code_2(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(sys, "argv", ["gerar-senha", "--length", "5"])
    with pytest.raises(SystemExit) as exc:
        main()
    assert exc.value.code == 2


def test_cli_no_charset_exit_2(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        sys,
        "argv",
        [
            "gerar-senha",
            "--no-lower",
            "--no-upper",
            "--no-digits",
            "--no-symbols",
        ],
    )
    with pytest.raises(SystemExit) as exc:
        main()
    assert exc.value.code == 2


def test_cli_count_zero_exit_2(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(sys, "argv", ["gerar-senha", "--count", "0"])
    with pytest.raises(SystemExit) as exc:
        main()
    assert exc.value.code == 2


def test_cli_prints_one_password_per_line(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    monkeypatch.setattr(
        sys,
        "argv",
        ["gerar-senha", "--length", "12", "--count", "3", "--no-symbols"],
    )
    main()
    out = capsys.readouterr().out.strip().splitlines()
    assert len(out) == 3
    assert all(len(line) == 12 for line in out)
    assert all(line == line.strip() for line in out)
