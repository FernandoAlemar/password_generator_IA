"""Interface de linha de comando."""

from __future__ import annotations

import argparse
import sys

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
    return parser


def main() -> None:
    parser = _build_parser()
    args = parser.parse_args()
    if args.count < 1:
        print("count deve ser >= 1.", file=sys.stderr)
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


if __name__ == "__main__":
    main()
