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

const { validate, generatePassword, MAX_COUNT, MAX_LENGTH, MIN_LENGTH } =
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

const { values } = parseArgs({
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
});

if (values.help) {
  printHelp();
  process.exit(0);
}

const length = Number.parseInt(values.length, 10);
const count = Number.parseInt(values.count, 10);

const params = {
  length,
  useLower: !values["no-lower"],
  useUpper: !values["no-upper"],
  useDigits: !values["no-digits"],
  useSymbols: !values["no-symbols"],
  requireEach: Boolean(values["require-each"]),
};

if (count < 1 || count > MAX_COUNT) {
  console.error(`Quantidade deve estar entre 1 e ${MAX_COUNT}.`);
  process.exit(2);
}

const v = validate(params);
if (!v.ok) {
  console.error(v.message);
  process.exit(2);
}

for (let i = 0; i < count; i += 1) {
  console.log(generatePassword(params));
}
