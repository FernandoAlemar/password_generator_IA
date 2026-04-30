# Roteiro de demonstração técnica

Este ficheiro sugere uma **sequência de 3 a 5 minutos** para apresentar o projeto **Gerador de senhas seguras** (vídeo ou defesa oral). Não há API REST nem CRUD: o equivalente é a **interface web** + **CLI Node** + **testes automatizados**.

---

## 1. Problema e escopo

**Problema (30–45 s):** senhas fracas ou previsíveis; serviços opacos em que o utilizador não controla onde a senha passa; uso indevido de `Math.random()` para segurança.

**Solução deste projeto:** gerador **local** — a página corre no **navegador**, a CLI no **Node** — com a mesma lógica em [`web/password.mjs`](web/password.mjs) e aleatoriedade só com **`crypto.getRandomValues`**.

**Escopo:** comprimento 8–64, conjuntos opcionais (minúsculas, maiúsculas, dígitos, símbolos), política “garantir um de cada conjunto”, até 20 senhas por geração na web. **Fora de escopo:** servidor que armazene ou trate senhas em backend próprio.

---

## 2. Arquitetura resumida (45–60 s)

Um único **núcleo** (`password.mjs`) é usado por dois **consumidores**: a página (`app.mjs` + `index.html`) e a linha de comando (`cli.mjs`). O diagrama Mermaid está no [README.md](README.md) (secção **Arquitetura**).

```mermaid
flowchart LR
  Lib[password_mjs]
  App[app_mjs]
  Cli[cli_mjs]
  RNG[WebCrypto]
  App --> Lib
  Cli --> Lib
  Lib --> RNG
```

---

## 3. Execução (web + CLI) (60–90 s)

**Web**

1. Abrir [`web/index.html`](web/index.html) (ficheiro local) **ou** servir a pasta `web/` com um servidor HTTP (recomendado para testar **Copiar resultado**).
2. Clicar em **Gerar** com valores por omissão e mostrar o resultado na área de texto.

**CLI** (na **raiz** do repositório, com [Node.js](https://nodejs.org/) 19+)

```bash
npm install
npx gerar-senha --help
node cli.mjs --length 20 --count 2
```

Mostrar uma ou duas linhas de senha no terminal e mencionar que erros de validação vão para **stderr** com código de saída **2**.

---

## 4. Fluxo principal da interface (45–60 s)

Em vez de CRUD, o fluxo é **configurar → gerar → (opcional) copiar**.

1. Alterar **comprimento** ou desmarcar um conjunto (ex.: só minúsculas + dígitos) e **Gerar** de novo.
2. Opcional: marcar **Garantir ao menos um caractere de cada conjunto marcado** e gerar.
3. Clicar em **Copiar resultado** (com `http(s):`) e apontar a **mensagem verde** de confirmação.
4. Opcional rápido: valor inválido (ex. comprimento fora de 8–64) e mostrar a **mensagem de erro** em vermelho.

---

## 5. Evidência de testes (30–45 s)

Na raiz:

```bash
npm test
```

Referência da suíte: [`test/password.test.mjs`](test/password.test.mjs) (`node:test`), cobrindo `validate`, geração dentro do alfabeto, `requireEach` e fumo de unicidade. Esperado: todas as linhas com **pass** e **fail 0**.

---

## Ligações úteis

- [README.md](README.md) — visão geral, requisitos, como executar, estrutura, IA (CO-STAR).
- [GUIA_DE_EXECUCAO.md](GUIA_DE_EXECUCAO.md) — passos locais, checklist, commits, CO-STAR detalhado.
