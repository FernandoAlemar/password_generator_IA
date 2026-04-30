#!/usr/bin/env node
/**
 * CLI Node.js: mesma lógica que o front (`web/password.mjs`).
 * Exige Node 19+ (Web Crypto global) ou polyfill abaixo para Node 18.
 */

import { webcrypto } from "node:crypto";
import { parseArgs } from "node:util";
import process from "node:process";

if (!globalThis.crypto?.getRandomValues) {
  globalThis.crypto = webcrypto;
}

const { validate, generateDistinctPasswords, MAX_COUNT, MAX_LENGTH, MIN_LENGTH } =
  await import("./web/password.mjs");

function printHelp() {
  console.log(`Uso: gerar-senha [opções]

Opções:
  --length N       Comprimento (${MIN_LENGTH}–${MAX_LENGTH}). Padrão: 16.
  --count N        Quantidade (1–${MAX_COUNT}). Padrão: 1.
  --no-lower       Excluir minúsculas (padrão: incluir).
  --no-upper       Excluir maiúsculas.
  --no-digits      Excluir dígitos.
  --no-symbols     Excluir símbolos.
  --require-each   Garantir ao menos um caractere de cada conjunto ativo.
  -h, --help       Esta ajuda.
`);
}

let values;
try {
  ({ values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      length: { type: "string", default: "16" },
      count: { type: "string", default: "1" },
      "no-lower": { type: "boolean" },
      "no-upper": { type: "boolean" },
      "no-digits": { type: "boolean" },
      "no-symbols": { type: "boolean" },
      "require-each": { type: "boolean" },
      help: { type: "boolean", short: "h" },
    },
    strict: true,
    allowPositionals: false,
  }));
} catch (err) {
  console.error(
    "Opção de linha de comando não reconhecida. Use --help para listar as opções suportadas.",
  );
  if (err && typeof err.message === "string") {
    console.error(err.message);
  }
  process.exit(2);
}

if (values.help) {
  printHelp();
  process.exit(0);
}

/** Aceita só inteiros decimais não negativos sem parte fracionária (`2.5` e `abc` falham). */
function strictUIntFromString(raw) {
  const t = String(raw).trim();
  if (!/^\d+$/.test(t)) return NaN;
  return Number.parseInt(t, 10);
}

const length = strictUIntFromString(values.length);
const count = strictUIntFromString(values.count);

function isValidPositiveInt(n) {
  return typeof n === "number" && Number.isFinite(n) && Number.isInteger(n);
}

if (!isValidPositiveInt(count) || count < 1 || count > MAX_COUNT) {
  console.error(
    `Quantidade deve ser um número inteiro entre 1 e ${MAX_COUNT} (recebido: ${String(values.count)}).`,
  );
  process.exit(2);
}

const params = {
  length,
  useLower: !values["no-lower"],
  useUpper: !values["no-upper"],
  useDigits: !values["no-digits"],
  useSymbols: !values["no-symbols"],
  requireEach: Boolean(values["require-each"]),
};

const v = validate(params);
if (!v.ok) {
  console.error(v.message);
  process.exit(2);
}

const batch = generateDistinctPasswords(params, count);
if (!batch.ok) {
  console.error(batch.message);
  process.exit(2);
}
for (const pwd of batch.passwords) {
  console.log(pwd);
}
