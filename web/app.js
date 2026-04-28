/**
 * Gerador de senhas no cliente: validação e alfabetos centralizados aqui.
 * RNG: apenas crypto.getRandomValues (sem Math.random).
 */

const MIN_LENGTH = 8;
const MAX_LENGTH = 64;
const MAX_COUNT = 20;

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%&*_-+=?";

/**
 * @param {number} maxExclusive
 * @returns {number} uniforme em [0, maxExclusive)
 */
function randomIndex(maxExclusive) {
  if (maxExclusive <= 0) throw new Error("maxExclusive inválido");
  const max = 256 - (256 % maxExclusive);
  const buf = new Uint8Array(1);
  let x;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= max);
  return x % maxExclusive;
}

/** @param {string} str */
function secureChoice(str) {
  return str[randomIndex(str.length)];
}

/** @param {string[]} arr mutável */
function secureShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * @param {{
 *   length: number,
 *   useLower: boolean,
 *   useUpper: boolean,
 *   useDigits: boolean,
 *   useSymbols: boolean,
 *   requireEach: boolean
 * }} params
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
function validate(params) {
  const { length, useLower, useUpper, useDigits, useSymbols, requireEach } = params;
  if (length < MIN_LENGTH || length > MAX_LENGTH) {
    return {
      ok: false,
      message: `Comprimento deve estar entre ${MIN_LENGTH} e ${MAX_LENGTH} (recebido: ${length}).`,
    };
  }
  const n = [useLower, useUpper, useDigits, useSymbols].filter(Boolean).length;
  if (n === 0) {
    return {
      ok: false,
      message:
        "Selecione ao menos um conjunto de caracteres (minúsculas, maiúsculas, dígitos ou símbolos).",
    };
  }
  if (requireEach && length < n) {
    return {
      ok: false,
      message:
        "Com política mínima (garantir um de cada conjunto), o comprimento deve ser >= ao número " +
        `de conjuntos selecionados (${n}); comprimento atual: ${length}.`,
    };
  }
  return { ok: true };
}

/**
 * @param {{
 *   length: number,
 *   useLower: boolean,
 *   useUpper: boolean,
 *   useDigits: boolean,
 *   useSymbols: boolean,
 *   requireEach: boolean
 * }} params
 */
function generatePassword(params) {
  const sets = [];
  if (params.useLower) sets.push(LOWERCASE);
  if (params.useUpper) sets.push(UPPERCASE);
  if (params.useDigits) sets.push(DIGITS);
  if (params.useSymbols) sets.push(SYMBOLS);
  const pool = sets.join("");

  const chars = [];
  if (params.requireEach) {
    for (const s of sets) {
      chars.push(secureChoice(s));
    }
    const remaining = params.length - chars.length;
    for (let i = 0; i < remaining; i += 1) {
      chars.push(secureChoice(pool));
    }
  } else {
    for (let i = 0; i < params.length; i += 1) {
      chars.push(secureChoice(pool));
    }
  }
  secureShuffle(chars);
  return chars.join("");
}

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

function readCount() {
  const c = Number.parseInt(document.getElementById("count").value, 10);
  return Number.isFinite(c) ? c : 1;
}

function showError(message) {
  const el = document.getElementById("error");
  el.textContent = message;
  el.classList.add("visible");
}

function hideError() {
  const el = document.getElementById("error");
  el.textContent = "";
  el.classList.remove("visible");
}

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
