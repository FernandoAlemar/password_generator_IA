/**
 * Interface do formulário no navegador. A lógica de senhas está em {@link ./password.mjs}.
 */

import {
  MAX_COUNT,
  generatePassword,
  validate,
} from "./password.mjs";

/** Lê o formulário e devolve o objeto usado por {@link validate} e {@link generatePassword}. */
function readParams() {
  const length = Number.parseInt(document.getElementById("length").value, 10);
  return {
    length,
    useLower: document.getElementById("useLower").checked,
    useUpper: document.getElementById("useUpper").checked,
    useDigits: document.getElementById("useDigits").checked,
    useSymbols: document.getElementById("useSymbols").checked,
    requireEach: document.getElementById("requireEach").checked,
  };
}

/** Quantidade de senhas a gerar (campo “Quantidade” no HTML). */
function readCount() {
  const c = Number.parseInt(document.getElementById("count").value, 10);
  return Number.isFinite(c) ? c : 1;
}

/** Exibe mensagem de erro acima da área de resultado. @param {string} message */
function showError(message) {
  const el = document.getElementById("error");
  el.textContent = message;
  el.classList.add("visible");
}

/** Esconde a faixa de erro. */
function hideError() {
  const el = document.getElementById("error");
  el.textContent = "";
  el.classList.remove("visible");
}

/**
 * Handler do botão Gerar: valida, gera `count` senhas e preenche `#output`.
 */
function onGenerate() {
  hideError();
  const params = readParams();
  const count = readCount();

  if (count < 1 || count > MAX_COUNT) {
    showError(`Quantidade deve estar entre 1 e ${MAX_COUNT}.`);
    return;
  }

  const v = validate(params);
  if (!v.ok) {
    showError(v.message);
    return;
  }

  const lines = [];
  for (let i = 0; i < count; i += 1) {
    lines.push(generatePassword(params));
  }
  document.getElementById("output").textContent = lines.join("\n");
}

/**
 * Copia o texto atual de `#output` para a área de transferência (API Clipboard).
 */
async function onCopy() {
  hideError();
  const text = document.getElementById("output").textContent.trim();
  if (!text) {
    showError("Gere ao menos uma senha antes de copiar.");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    showError("Não foi possível copiar (permissão ou contexto inseguro).");
  }
}

document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  onGenerate();
});

document.getElementById("btnCopy").addEventListener("click", () => {
  void onCopy();
});
