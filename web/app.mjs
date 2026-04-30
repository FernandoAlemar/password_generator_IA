/**
 * Interface do formulário no navegador. A lógica de senhas está em {@link ./password.mjs}.
 */

import {
  MAX_COUNT,
  generateDistinctPasswords,
  validate,
} from "./password.mjs";

/** Lê o formulário e devolve o objeto usado por {@link validate} e {@link generateDistinctPasswords}. */
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
  return Number.parseInt(document.getElementById("count").value, 10);
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

/** @type {ReturnType<typeof setTimeout> | undefined} */
let copyFeedbackTimer;

/** Esconde a mensagem de confirmação de cópia. */
function hideCopyFeedback() {
  const el = document.getElementById("copyFeedback");
  el.textContent = "";
  el.classList.remove("visible");
  if (copyFeedbackTimer !== undefined) {
    clearTimeout(copyFeedbackTimer);
    copyFeedbackTimer = undefined;
  }
}

/**
 * Mostra confirmação após copiar para o clipboard; some automaticamente.
 * @param {string} message
 */
function showCopyFeedback(message) {
  const el = document.getElementById("copyFeedback");
  el.textContent = message;
  el.classList.add("visible");
  if (copyFeedbackTimer !== undefined) {
    clearTimeout(copyFeedbackTimer);
  }
  copyFeedbackTimer = setTimeout(() => {
    el.classList.remove("visible");
    el.textContent = "";
    copyFeedbackTimer = undefined;
  }, 3500);
}

/**
 * Handler do botão Gerar: valida, gera `count` senhas e preenche `#output`.
 */
function onGenerate() {
  hideError();
  hideCopyFeedback();
  const params = readParams();
  const count = readCount();

  if (
    typeof count !== "number" ||
    !Number.isFinite(count) ||
    !Number.isInteger(count) ||
    count < 1 ||
    count > MAX_COUNT
  ) {
    showError(
      `Quantidade deve ser um número inteiro entre 1 e ${MAX_COUNT}.`,
    );
    return;
  }

  const v = validate(params);
  if (!v.ok) {
    showError(v.message);
    return;
  }

  const batch = generateDistinctPasswords(params, count);
  if (!batch.ok) {
    showError(batch.message);
    return;
  }
  document.getElementById("output").textContent = batch.passwords.join("\n");
}

/**
 * Copia o texto atual de `#output` para a área de transferência (API Clipboard).
 */
async function onCopy() {
  hideError();
  hideCopyFeedback();
  const text = document.getElementById("output").textContent.trim();
  if (!text) {
    showError("Gere ao menos uma senha antes de copiar.");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    const linhas = text.split("\n").filter((l) => l.length > 0).length;
    const msg =
      linhas > 1
        ? "Senhas copiadas para a área de transferência."
        : "Senha copiada para a área de transferência.";
    showCopyFeedback(msg);
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
