"""Interface de linha de comando."""

from __future__ import annotations

import argparse
import sys
import threading

import pyperclip

from pwgen.core import generate_passwords
from pwgen.policy import GenerationParams, PolicyError


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="gerar-senha",
        description="Gera senhas aleatórias com critérios configuráveis.",
    )
    parser.add_argument(
        "--length",
        type=int,
        default=16,
        metavar="N",
        help="Comprimento da senha (8–64). Padrão: 16.",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=1,
        metavar="N",
        help="Quantidade de senhas a gerar. Padrão: 1.",
    )
    parser.add_argument(
        "--lower",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Incluir minúsculas (padrão: sim).",
    )
    parser.add_argument(
        "--upper",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Incluir maiúsculas (padrão: sim).",
    )
    parser.add_argument(
        "--digits",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Incluir dígitos (padrão: sim).",
    )
    parser.add_argument(
        "--symbols",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Incluir símbolos (padrão: sim).",
    )
    parser.add_argument(
        "--require-each",
        action="store_true",
        help="Garantir ao menos um caractere de cada conjunto selecionado.",
    )
    parser.add_argument(
        "--copy",
        action="store_true",
        help=(
            "Após gerar, pergunta se copia a senha para o clipboard (exige --count 1)."
        ),
    )
    parser.add_argument(
        "--copy-clear-after",
        type=int,
        default=0,
        metavar="SEG",
        help=(
            "Se > 0 e você confirmar --copy, tenta limpar o clipboard após SEG s "
            "(apenas se o texto ainda for a senha). Padrão: 0 (não limpa)."
        ),
    )
    return parser


def _confirm_clipboard_copy() -> bool:
    prompt = "Copiar a senha para a área de transferência? [s/N]: "
    try:
        reply = input(prompt).strip().lower()
    except EOFError:
        return False
    return reply in ("s", "sim", "y", "yes")


def _schedule_clipboard_clear(expected_text: str, seconds: int) -> None:
    if seconds <= 0:
        return

    def clear() -> None:
        try:
            if pyperclip.paste() == expected_text:
                pyperclip.copy("")
        except pyperclip.PyperclipException:
            pass

    timer = threading.Timer(seconds, clear)
    timer.daemon = True
    timer.start()


def _offer_clipboard_copy(password: str, clear_after: int) -> None:
    if not _confirm_clipboard_copy():
        return
    try:
        pyperclip.copy(password)
    except pyperclip.PyperclipException as e:
        print(f"Não foi possível copiar para o clipboard: {e}", file=sys.stderr)
        return
    if clear_after > 0:
        _schedule_clipboard_clear(password, clear_after)
        print(
            f"Aviso: o clipboard pode ser limpo após {clear_after}s se o texto "
            "ainda for só esta senha.",
            file=sys.stderr,
        )


def main() -> None:
    parser = _build_parser()
    args = parser.parse_args()
    if args.count < 1:
        print("count deve ser >= 1.", file=sys.stderr)
        sys.exit(2)
    if args.copy and args.count != 1:
        print("A opção --copy exige --count 1.", file=sys.stderr)
        sys.exit(2)
    if args.copy_clear_after < 0:
        print("--copy-clear-after deve ser >= 0.", file=sys.stderr)
        sys.exit(2)
    params = GenerationParams(
        length=args.length,
        use_lower=args.lower,
        use_upper=args.upper,
        use_digits=args.digits,
        use_symbols=args.symbols,
        require_each=args.require_each,
    )
    try:
        passwords = generate_passwords(params, args.count)
    except PolicyError as e:
        print(str(e), file=sys.stderr)
        sys.exit(2)
    except ValueError as e:
        print(str(e), file=sys.stderr)
        sys.exit(2)
    for line in passwords:
        print(line)
    if args.copy:
        _offer_clipboard_copy(passwords[0], args.copy_clear_after)


if __name__ == "__main__":
    main()
