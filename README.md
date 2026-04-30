# Gerador de senhas seguras

Aplicação **estática** em HTML/CSS/JavaScript: formulário no navegador para comprimento (8–64), conjuntos de caracteres, política mínima (pelo menos um de cada conjunto marcado) e quantidade (1–20). A mesma lógica de validação e geração está em **`web/password.mjs`**, reutilizada pela página (`app.mjs`) e pela **CLI Node** (`cli.mjs`). A aleatoriedade usa apenas **`crypto.getRandomValues`** (sem `Math.random()`).

**Demonstração técnica (3–5 min):** roteiro em [Demo.md](Demo.md).

## Requisitos

- Navegador moderno (Chrome, Firefox, Edge ou equivalente) — para a interface em `web/`
- [Node.js](https://nodejs.org/) **19 ou superior** — apenas para a CLI (`cli.mjs` / `npx gerar-senha`)

## Como executar

### Abrir a página no navegador

**Opção 1 — arquivo local (`file://`):**

1. No Explorador de Arquivos (Windows), abra a pasta **`web/`** dentro do repositório, por exemplo `d:\gerarSenha\web\`.
2. Faça **duplo clique** em **`index.html`**, ou arraste esse arquivo para uma janela do Chrome, Edge ou Firefox.
  Alternativa: no navegador, **Arquivo → Abrir arquivo…** (ou `Ctrl+O`) e escolha `web\index.html`.
3. Confirme na barra de endereços um URL do tipo `file:///…/web/index.html`. Os recursos `styles.css` e `app.mjs` carregam por caminhos relativos na mesma pasta.

**Nota:** em `file://`, o botão **Copiar resultado** pode não funcionar; nesse caso use a Opção 2.

**Opção 2 — servidor HTTP local (recomendado para clipboard):** use um servidor de arquivos estáticos para servir a pasta `web/` (extensão **Live Server**, “Simple Browser” no editor, `npx serve web`, etc.). Na **raiz** do repositório, um exemplo é:

```bash
npx serve web
```

O terminal mostra um URL **Local** (ex.: `http://localhost:3000`) e, em muitos casos, um URL de **Network** na mesma LAN. Se a porta **3000** estiver ocupada, o `serve` escolhe outra (ex.: `63643`) e indica isso na mensagem. Abra o **Local** ou o **Network** no Chrome, Edge ou Firefox.

Com **HTTP** (não `file://`), **Copiar resultado** costuma funcionar; surge uma **mensagem verde** (“Senha copiada…”) por alguns segundos. O aviso “Não seguro” no browser é normal em HTTP local.

### Passo a passo de teste da página na web

1. Com o servidor em execução, abra o URL indicado (ex.: `http://127.0.0.1:PORTA` ou o IP mostrado em **Network**).
2. Defina **Comprimento** (ex.: `16`) e **Quantidade** (ex.: `1`).
3. Marque ou desmarque **Minúsculas**, **Maiúsculas**, **Dígitos** e **Símbolos** — por exemplo só **Símbolos** — e clique em **Gerar**; confirme que o texto na caixa tracejada só contém símbolos permitidos.
4. Opcional: ative **Garantir pelo menos um caractere de cada conjunto marcado**, gere de novo e verifique que cada tipo marcado aparece na senha.
5. Clique em **Copiar resultado** e confirme a mensagem verde; cole em outra aplicação para validar a área de transferência.
6. Opcional: insira um comprimento fora de **8–64** ou combinações inválidas e confirme a **mensagem de erro** em vermelho acima do resultado.

**Opção 3 — linha de comando (Node.js):** na raiz do repositório, execute `npm install` (registra o binário localmente) e use `npx gerar-senha --help` ou, em desenvolvimento, `node cli.mjs --length 20 --count 2`. Cada senha sai em uma linha no stdout; erros de validação vão para stderr e o processo termina com código **2**.

**Unicidade só no pedido atual (web e CLI):** ao pedir **N** senhas de uma vez, o núcleo usa `generateDistinctPasswords` em [web/password.mjs](web/password.mjs): um `Set` guarda as senhas já geradas nesse lote; para cada posição, chama `generatePassword` até obter uma string nova ou esgotar **até 100 tentativas** por posição (`MAX_DISTINCT_ATTEMPTS_PER_PASSWORD`). Se não for possível (espaço de senhas pequeno demais para N distintas), a interface mostra erro e a CLI termina com código **2**. Isto **não** garante que uma senha nunca se repita noutro clique ou noutra execução — só evita linhas duplicadas **no mesmo resultado**. O projeto **não grava** senhas; para guardar as que importam, use um **gestor de senhas**.

**Testes (`npm test`):** na raiz, com Node 19+, `npm test` executa [`node:test`](https://nodejs.org/api/test.html) em [test/password.test.mjs](test/password.test.mjs) (núcleo: `validate`, geração, `generateDistinctPasswords`, `requireEach`, smoke test de aleatoriedade) e [test/cli.test.mjs](test/cli.test.mjs) (CLI: flags inválidas, códigos de saída, `--help`, lote com linhas distintas).

## Estrutura

- [web/index.html](web/index.html) — página e formulário
- [web/password.mjs](web/password.mjs) — núcleo: validação e geração com Web Crypto (**JSDoc**)
- [web/app.mjs](web/app.mjs) — formulário, eventos e cópia para o clipboard (mensagem verde de confirmação após copiar com sucesso)
- [web/styles.css](web/styles.css) — estilos
- [cli.mjs](cli.mjs) — CLI que importa o mesmo `password.mjs`
- [package.json](package.json) — `type: "module"`, `engines.node`, `bin.gerar-senha` e script `test`
- [test/password.test.mjs](test/password.test.mjs) — testes do núcleo (`npm test`)
- [test/cli.test.mjs](test/cli.test.mjs) — testes de integração da CLI (`npm test`)
- [Demo.md](Demo.md) — roteiro de demonstração técnica 

## Segurança (lembretes)

- Prefira senhas longas (16+) e um gerenciador de senhas.
- Não envie senhas geradas para servidores desconhecidos; a página roda **no seu navegador** e a CLI roda **localmente no Node** — sem backend próprio neste repositório.
- O gerador **não persiste** senhas em disco nem em servidor; unicidade “sem repetir linha” aplica-se **apenas ao lote atual** (ver parágrafo **Unicidade só no pedido atual** acima).

## Arquitetura (diagrama Mermaid)

Fluxo típico desta aplicação (sem backend):

```mermaid
flowchart LR
  User[Usuário]
  UI[HTML_CSS]
  App[app_mjs]
  Lib[password_mjs]
  Cli[cli_mjs]
  RNG[WebCrypto]
  User -->|preenche_e_gera| UI
  UI -->|eventos| App
  App --> Lib
  Cli --> Lib
  Lib -->|getRandomValues| RNG
  App -->|atualiza_tela| User
```



## Uso de IA no desenvolvimento

Este projeto utilizou **IA generativa** (por exemplo no Cursor) para:

- **estruturar o repositório** — organização em núcleo compartilhado (`web/password.mjs`), interface web (`web/app.mjs`, `index.html`, estilos) e CLI Node (`cli.mjs`, `package.json`);
- **produzir e ajustar o código-fonte** com base em **prompts** alinhados aos requisitos (comprimento, conjuntos de caracteres, política mínima, quantidade, `crypto.getRandomValues`, etc.);
- **criar e evoluir os testes automatizados** (`test/password.test.mjs`, `test/cli.test.mjs`, `npm test` / [`node:test`](https://nodejs.org/api/test.html)).

A IA também ajudou na **criação e no refinamento dos próprios prompts**, incluindo o encaixe com o framework **CO-STAR** (ver a seção seguinte e o [GUIA de execução, CO-STAR](GUIA_DE_EXECUCAO.md#11-co-star-exemplo-para-este-mvp)).

**Transparência:** o resultado foi sempre sujeito a **revisão humana** (comportamento, mensagens em português, consistência entre web, CLI e documentação).

## Prompt estruturado: CO-STAR

Neste repositório, ao usar **IA para gerar ou alterar código-fonte**, o prompt deve seguir **CO-STAR** e a convenção do projeto exige que o **código-fonte entregue esteja integralmente documentado** (JSDoc em JavaScript; comentários/HTML onde fizer sentido). Detalhes e exemplo preenchido: [GUIA_DE_EXECUCAO.md, seção 11](GUIA_DE_EXECUCAO.md#11-co-star-exemplo-para-este-mvp).

## Commits (padrão do repositório)

Este projeto adota **[Conventional Commits](https://www.conventionalcommits.org/)**: `tipo(escopo): descrição` em português.


| Tipo    | Uso                 |
| ------- | ------------------- |
| `feat`  | Nova funcionalidade |
| `fix`   | Correção de bug     |
| `docs`  | Documentação        |
| `chore` | Manutenção          |


**Escopos sugeridos:** `web`, `cli`, `test`, `readme`, `guia`.

**Exemplos:**

```text
feat(web): adiciona botão de limpar resultado
fix(web): corrige validação do comprimento mínimo
docs(readme): atualiza instruções de execução local
```

  


Integração contínua: em push ou pull request para `main` ou `master`, o workflow [.github/workflows/ci.yml](.github/workflows/ci.yml) executa `npm run lint` (sintaxe com `node --check`) e `npm test` (Node 20). Localmente: `npm run lint` e `npm test`.

Mais detalhes em [GUIA_DE_EXECUCAO.md](GUIA_DE_EXECUCAO.md). Roteiro de apresentação: [Demo.md](Demo.md).