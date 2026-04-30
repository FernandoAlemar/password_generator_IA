/**
 * Núcleo compartilhado: validação e geração de senhas (navegador e Node.js).
 * Usa apenas `globalThis.crypto.getRandomValues` (nunca Math.random).
 * No Node.js, faça o polyfill de `globalThis.crypto` antes de importar este módulo (ver `cli.mjs`).
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
 */

export const MIN_LENGTH = 8;
export const MAX_LENGTH = 64;
export const MAX_COUNT = 20;

export const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
export const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const DIGITS = "0123456789";
export const SYMBOLS = "!@#$%&*_-+=?";

/**
 * @typedef {Object} GenerationParams
 * @property {number} length comprimento desejado (8–64)
 * @property {boolean} useLower incluir minúsculas
 * @property {boolean} useUpper incluir maiúsculas
 * @property {boolean} useDigits incluir dígitos
 * @property {boolean} useSymbols incluir símbolos (lista fixa SYMBOLS)
 * @property {boolean} requireEach garantir ao menos um caractere de cada conjunto ativo
 */

/**
 * @param {number} maxExclusive
 * @returns {number}
 */
function randomIndex(maxExclusive) {
  if (maxExclusive <= 0) throw new Error("maxExclusive inválido");
  const c = globalThis.crypto;
  if (!c?.getRandomValues) {
    throw new Error("Web Crypto indisponível: use Node 19+ ou defina globalThis.crypto antes de importar.");
  }
  const max = 256 - (256 % maxExclusive);
  const buf = new Uint8Array(1);
  let x;
  do {
    c.getRandomValues(buf);
    x = buf[0];
  } while (x >= max);
  return x % maxExclusive;
}

/** @param {string} str */
function secureChoice(str) {
  return str[randomIndex(str.length)];
}

/** @param {string[]} arr */
function secureShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * @param {GenerationParams} params
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function validate(params) {
  const { length, useLower, useUpper, useDigits, useSymbols, requireEach } = params;
  if (typeof length !== "number" || !Number.isFinite(length) || !Number.isInteger(length)) {
    return {
      ok: false,
      message: `Comprimento deve ser um número inteiro entre ${MIN_LENGTH} e ${MAX_LENGTH} (recebido: ${String(length)}).`,
    };
  }
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
 * @param {GenerationParams} params
 * @returns {string}
 */
export function generatePassword(params) {
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
