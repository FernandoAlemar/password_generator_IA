/**
 * Testes do núcleo `web/password.mjs`: validação, caracteres permitidos e política “um de cada”.
 * Executar na raiz: `npm test` ou `node --test test/`
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
  DIGITS,
  LOWERCASE,
  MAX_COUNT,
  MAX_LENGTH,
  MIN_LENGTH,
  SYMBOLS,
  UPPERCASE,
  generatePassword,
  validate,
} from "../web/password.mjs";

/** @param {string} s flags L U D S */
function buildPool(s) {
  const parts = [];
  if (s.includes("L")) parts.push(LOWERCASE);
  if (s.includes("U")) parts.push(UPPERCASE);
  if (s.includes("D")) parts.push(DIGITS);
  if (s.includes("S")) parts.push(SYMBOLS);
  return parts.join("");
}

/**
 * @param {import("../web/password.mjs").GenerationParams} p
 * @param {string} flags L U D S ativos
 */
function paramsFromFlags(length, flags, requireEach) {
  return {
    length,
    useLower: flags.includes("L"),
    useUpper: flags.includes("U"),
    useDigits: flags.includes("D"),
    useSymbols: flags.includes("S"),
    requireEach,
  };
}

test("validate rejeita comprimento fora do intervalo", () => {
  const base = paramsFromFlags(16, "LUDS", false);
  assert.equal(validate({ ...base, length: MIN_LENGTH - 1 }).ok, false);
  assert.equal(validate({ ...base, length: MAX_LENGTH + 1 }).ok, false);
  assert.equal(validate({ ...base, length: MIN_LENGTH }).ok, true);
  assert.equal(validate({ ...base, length: MAX_LENGTH }).ok, true);
});

test("validate rejeita comprimento não inteiro, NaN ou infinito", () => {
  const base = paramsFromFlags(16, "LUDS", false);
  for (const length of [NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 10.5, 12.7]) {
    const r = validate({ ...base, length });
    assert.equal(r.ok, false, `length=${length}`);
    assert.ok(
      r.message.includes("inteiro") || r.message.includes(String(length)),
      r.message,
    );
  }
});

test("validate rejeita comprimento quando length não é número", () => {
  const base = paramsFromFlags(16, "LUDS", false);
  // @ts-expect-error teste de tipo inválido em runtime
  const r = validate({ ...base, length: "16" });
  assert.equal(r.ok, false);
});

/**
 * Garante que o teto exportado em `MAX_LENGTH` se reflete em `validate` e em `generatePassword`.
 * Assim, ao alterar só `MAX_LENGTH` em `password.mjs`, este cenário continua explícito na suíte.
 */
test("comprimento máximo MAX_LENGTH: validate aceita e generatePassword gera exatamente esse tamanho", () => {
  const base = paramsFromFlags(MAX_LENGTH, "LUDS", false);
  assert.equal(validate(base).ok, true);
  assert.equal(validate({ ...base, length: MAX_LENGTH + 1 }).ok, false);
  const over = validate({ ...base, length: MAX_LENGTH + 1 });
  assert.ok(
    over.ok === false && over.message.includes(String(MAX_LENGTH + 1)),
    over.message,
  );
  for (let i = 0; i < 25; i += 1) {
    const pwd = generatePassword(base);
    assert.equal(
      pwd.length,
      MAX_LENGTH,
      `esperado comprimento ${MAX_LENGTH}, obtido ${pwd.length}`,
    );
  }
});

test("validate rejeita quando nenhum conjunto está ativo", () => {
  const r = validate({
    length: 12,
    useLower: false,
    useUpper: false,
    useDigits: false,
    useSymbols: false,
    requireEach: false,
  });
  assert.equal(r.ok, false);
});

test("validate rejeita comprimento abaixo do mínimo antes de outras regras", () => {
  const r = validate(paramsFromFlags(3, "LUDS", true));
  assert.equal(r.ok, false);
  assert.ok(r.message.includes(String(MIN_LENGTH)), r.message);
});

test("validate aceita requireEach quando length >= número de conjuntos e mínimo global", () => {
  assert.equal(validate(paramsFromFlags(8, "LUDS", true)).ok, true);
});

test("generatePassword respeita comprimento e só usa caracteres do pool", () => {
  const pool = buildPool("LUDS");
  for (let i = 0; i < 150; i += 1) {
    const pwd = generatePassword(paramsFromFlags(20, "LUDS", false));
    assert.equal(pwd.length, 20);
    for (const ch of pwd) {
      assert.ok(
        pool.includes(ch),
        `caractere inesperado: ${JSON.stringify(ch)}`,
      );
    }
  }
});

test("generatePassword com um só conjunto mantém-se nesse alfabeto", () => {
  for (let i = 0; i < 80; i += 1) {
    const pwd = generatePassword(paramsFromFlags(24, "L", false));
    assert.match(pwd, /^[a-z]{24}$/);
  }
});

test("com requireEach e quatro conjuntos, cada senha contém ao menos um de cada tipo", () => {
  const p = paramsFromFlags(16, "LUDS", true);
  assert.equal(validate(p).ok, true);
  for (let i = 0; i < 200; i += 1) {
    const pwd = generatePassword(p);
    assert.match(pwd, /[a-z]/);
    assert.match(pwd, /[A-Z]/);
    assert.match(pwd, /[0-9]/);
    assert.ok(
      [...pwd].some((c) => SYMBOLS.includes(c)),
      "deve existir ao menos um símbolo da lista SYMBOLS",
    );
  }
});

test("símbolos pertencem apenas ao conjunto SYMBOLS exportado", () => {
  const p = paramsFromFlags(32, "S", false);
  for (let i = 0; i < 50; i += 1) {
    const pwd = generatePassword(p);
    for (const ch of pwd) {
      assert.ok(SYMBOLS.includes(ch));
    }
  }
});

test("gerações consecutivas tendem a ser distintas (fumaça de aleatoriedade)", () => {
  const p = paramsFromFlags(16, "LUDS", false);
  const set = new Set();
  const n = 60;
  for (let i = 0; i < n; i += 1) {
    set.add(generatePassword(p));
  }
  assert.ok(
    set.size >= 50,
    `esperava muitas senhas únicas, obtidas ${set.size} de ${n}`,
  );
});

test("MAX_COUNT permanece alinhado ao formulário (20)", () => {
  assert.equal(MAX_COUNT, 20);
});
