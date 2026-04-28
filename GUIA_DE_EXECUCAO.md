# Guia de execução — MVP Gerador de senhas seguras (Unidade 2)

Este documento descreve **como preparar o ambiente, instalar, usar a CLI e validar o projeto** conforme o miniprojeto do plano: core + policy + CLI (`argparse`), testes (`pytest` + `hypothesis`), RNG seguro (`secrets` / `SystemRandom`) e critérios RF01–RF04 (RF05 clipboard opcional).

---

## 1. Pré-requisitos

| Item | Detalhe |
|------|---------|
| Python | **3.10 ou superior** |
| Git | Para clonar o repositório (se aplicável) |
| Terminal | PowerShell, CMD ou bash |

Confirme a versão:

```bash
python --version
```

---

## 2. Obter o código

```bash
cd d:\gerarSenha
```

(Se o projeto estiver em outro caminho, use o diretório raiz onde está o arquivo `pyproject.toml`.)

---

## 3. Ambiente virtual (recomendado)

**Windows (PowerShell):**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**Linux / macOS:**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

## 4. Instalação do pacote (modo editável + dependências de desenvolvimento)

Na **raiz do repositório** (onde está `pyproject.toml`):

```bash
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
```

Isso instala o pacote `pwgen` a partir de `src/` e registra o comando **`gerar-senha`**.

**Se `pip install -e` falhar ao ler `README.md` (encoding no Windows):** o `pyproject.toml` pode não referenciar `readme`; nesse caso a instalação usa só a `description`. O arquivo `README.md` continua no repositório para leitura humana.

---

## 5. Executar a CLI

Com o ambiente virtual **ativado** e a instalação concluída:

| Objetivo | Comando |
|----------|---------|
| Ajuda | `gerar-senha --help` |
| Uso padrão (16 caracteres, todos os conjuntos) | `gerar-senha` |
| Comprimento e quantidade (RF01, RF04) | `gerar-senha --length 20 --count 3` |
| Desligar símbolos / dígitos / maiúsculas / minúsculas (RF02) | `gerar-senha --no-symbols` (idem `--no-digits`, `--no-upper`, `--no-lower`) |
| Política mínima: ≥1 de cada conjunto selecionado (RF03) | `gerar-senha --length 16 --require-each` |

**Saída:** uma senha por linha no **stdout**.  
**Erros de validação:** mensagem no **stderr**, código de saída **2**.

### Executar sem instalar o entrypoint (alternativa)

Útil para depuração, com `PYTHONPATH` apontando para `src`:

**PowerShell:**

```powershell
$env:PYTHONPATH = "src"
python -m pwgen.cli --help
```

---

## 6. Testes automatizados

Na raiz do projeto:

```bash
python -m pytest
```

Com mais detalhe:

```bash
python -m pytest -v
```

O `pyproject.toml` já define `testpaths = ["tests"]` e `pythonpath = ["src"]`.

---

## 7. Lint e formatação (Ruff)

```bash
python -m ruff check src tests
python -m ruff format --check src tests
```

Para aplicar formatação:

```bash
python -m ruff format src tests
```

---

## 8. Estrutura esperada (plano)

| Caminho | Função |
|---------|--------|
| [src/pwgen/core.py](src/pwgen/core.py) | Geração e conjuntos de caracteres |
| [src/pwgen/policy.py](src/pwgen/policy.py) | Validação (comprimento 8–64, conjuntos, `--require-each`) |
| [src/pwgen/cli.py](src/pwgen/cli.py) | `argparse`, saída e código de saída |
| [tests/](tests/) | `test_core`, `test_policy`, `test_cli` (+ Hypothesis onde aplicável) |

---

## 9. Checklist rápido de “pronto para entrega”

- [ ] `python -m pip install -e ".[dev]"` conclui sem erro  
- [ ] `gerar-senha --help` exibe as flags  
- [ ] `python -m pytest` — todos os testes passando  
- [ ] Repositório com `.gitignore` adequado (`__pycache__`, `.venv`, `.pytest_cache`, etc.)  
- [ ] README ou documentação com objetivo e exemplos (ver [README.md](README.md))  
- [ ] (Opcional) RF05: copiar para área de transferência com confirmação — não faz parte do núcleo atual do plano  

---

## 10. Git e Conventional Commits (padrão do repositório)

O histórico deve seguir **[Conventional Commits](https://www.conventionalcommits.org/)** na prática:

**Formato:** `tipo(escopo): descrição`

- **tipo:** `feat`, `fix`, `test`, `docs`, `chore`, etc.
- **escopo:** opcional; ex.: `pwgen`, `cli`, `policy`, `core`, `tests`, `readme`, `guia`
- **descrição:** curta, em português, modo imperativo (ex.: “adiciona”, “corrige”, “inclui”)

**Exemplos alinhados ao material da disciplina:**

```text
feat(api): adiciona endpoint POST /tasks
fix(service): corrige validação de prioridade
test(tasks): adiciona testes para criação de tarefa
docs(readme): inclui guia de execução
```

**Exemplos neste projeto:**

```text
feat(pwgen): adiciona política mínima com --require-each
fix(cli): corrige código de saída em erro de validação
test(policy): adiciona casos para comprimento e conjuntos
docs(guia): atualiza passos de instalação no Windows
```

**Fluxo básico:**

```bash
git status
git add caminho/do/arquivo
git commit -m "docs(readme): inclui guia de execução"
```

Convém commitar **antes** de incluir `.venv/`; o `.gitignore` já ignora ambientes virtuais comuns.

O padrão também está resumido no [README.md](README.md).

---

*Última atualização alinhada ao MVP CLI Python do plano Unidade 2.*
