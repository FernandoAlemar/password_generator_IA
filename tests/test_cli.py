"""Testes da CLI."""

from __future__ import annotations

import sys
from unittest.mock import MagicMock

import pytest

from pwgen.cli import main


def test_cli_help(monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]) -> None:
    monkeypatch.setattr(sys, "argv", ["gerar-senha", "--help"])
    with pytest.raises(SystemExit) as exc:
        main()
    assert exc.value.code == 0
    captured = capsys.readouterr()
    assert "--length" in captured.out
    assert "--copy" in captured.out


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


def test_cli_copy_requires_count_1(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        sys,
        "argv",
        ["gerar-senha", "--copy", "--count", "2", "--no-symbols"],
    )
    with pytest.raises(SystemExit) as exc:
        main()
    assert exc.value.code == 2


def test_cli_copy_clear_after_negative(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        sys,
        "argv",
        ["gerar-senha", "--copy", "--copy-clear-after", "-1"],
    )
    with pytest.raises(SystemExit) as exc:
        main()
    assert exc.value.code == 2


def test_cli_copy_when_confirmed(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    mock_copy = MagicMock()
    monkeypatch.setattr("pwgen.cli.pyperclip.copy", mock_copy)
    monkeypatch.setattr("builtins.input", lambda _prompt: "s")
    monkeypatch.setattr(
        sys,
        "argv",
        ["gerar-senha", "--length", "12", "--copy", "--no-symbols"],
    )
    main()
    mock_copy.assert_called_once()
    pwd = mock_copy.call_args[0][0]
    assert len(pwd) == 12
    out_lines = capsys.readouterr().out.strip().splitlines()
    assert len(out_lines) == 1
    assert out_lines[0] == pwd


def test_cli_copy_when_declined(monkeypatch: pytest.MonkeyPatch) -> None:
    mock_copy = MagicMock()
    monkeypatch.setattr("pwgen.cli.pyperclip.copy", mock_copy)
    monkeypatch.setattr("builtins.input", lambda _prompt: "n")
    monkeypatch.setattr(
        sys,
        "argv",
        ["gerar-senha", "--length", "10", "--copy", "--no-symbols"],
    )
    main()
    mock_copy.assert_not_called()
