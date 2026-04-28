"""Validação de parâmetros do gerador."""

from __future__ import annotations

from dataclasses import dataclass

MIN_LENGTH = 8
MAX_LENGTH = 64


class PolicyError(ValueError):
    """Parâmetros inválidos para geração de senha."""


@dataclass(frozen=True)
class GenerationParams:
    length: int
    use_lower: bool
    use_upper: bool
    use_digits: bool
    use_symbols: bool
    require_each: bool

    def selected_sets_count(self) -> int:
        return sum(
            (
                self.use_lower,
                self.use_upper,
                self.use_digits,
                self.use_symbols,
            )
        )


def validate(params: GenerationParams) -> None:
    if params.length < MIN_LENGTH or params.length > MAX_LENGTH:
        raise PolicyError(
            f"Comprimento deve estar entre {MIN_LENGTH} e {MAX_LENGTH} (recebido: {params.length})."
        )
    if params.selected_sets_count() == 0:
        raise PolicyError(
            "Selecione ao menos um conjunto de caracteres "
            "(minúsculas, maiúsculas, dígitos ou símbolos)."
        )
    if params.require_each and params.length < params.selected_sets_count():
        n = params.selected_sets_count()
        raise PolicyError(
            "Com política mínima (--require-each), o comprimento deve ser >= ao número "
            f"de conjuntos selecionados ({n}); comprimento atual: {params.length}."
        )
