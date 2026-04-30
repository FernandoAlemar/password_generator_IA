/**
 * Testes de integração da CLI (`cli.mjs`): parsing e códigos de saída.
 */

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = path.join(repoRoot, "cli.mjs");
const node = process.execPath;

/** @param {string[]} args */
function runCli(args) {
  return spawnSync(node, [cliPath, ...args], {
    encoding: "utf8",
    cwd: repoRoot,
  });
}

test("CLI: --count inválido termina com código 2 e stderr", () => {
  const r = runCli(["--count", "abc", "--length", "16"]);
  assert.equal(r.status, 2, r.stderr);
  assert.ok(r.stderr.length > 0, "stderr deve conter mensagem");
  assert.ok(
    r.stderr.includes("Quantidade") || r.stderr.includes("inteiro"),
    r.stderr,
  );
  assert.equal((r.stdout || "").trim(), "");
});

test("CLI: --length inválido termina com código 2 e stderr", () => {
  const r = runCli(["--length", "xyz", "--count", "1"]);
  assert.equal(r.status, 2, r.stderr);
  assert.ok(r.stderr.length > 0, r.stderr);
  assert.ok(
    r.stderr.includes("Comprimento") || r.stderr.includes("inteiro"),
    r.stderr,
  );
});

test("CLI: --count decimal é rejeitado", () => {
  const r = runCli(["--count", "2.5", "--length", "16"]);
  assert.equal(r.status, 2);
  assert.ok(r.stderr.length > 0);
});

test("CLI: geração bem-sucedida (stdout, código 0)", () => {
  const r = runCli(["--length", "12", "--count", "1"]);
  assert.equal(r.status, 0, r.stderr);
  const lines = (r.stdout || "").trim().split(/\r?\n/).filter(Boolean);
  assert.equal(lines.length, 1);
  assert.equal(lines[0].length, 12);
});

test("CLI: varias senhas no mesmo comando sao distintas", () => {
  const r = runCli(["--length", "14", "--count", "8"]);
  assert.equal(r.status, 0, r.stderr);
  const lines = (r.stdout || "").trim().split(/\r?\n/).filter(Boolean);
  assert.equal(lines.length, 8);
  assert.equal(new Set(lines).size, 8);
});

test("CLI: --help retorna 0", () => {
  const r = runCli(["--help"]);
  assert.equal(r.status, 0);
  assert.ok((r.stdout || "").includes("Uso:"));
});

test("CLI: opcao desconhecida termina com 2 e stderr amigavel", () => {
  const r = runCli(["--foo-inexistente"]);
  assert.equal(r.status, 2, r.stderr);
  assert.ok(
    (r.stderr || "").includes("reconhecida") ||
      (r.stderr || "").includes("help") ||
      (r.stderr || "").includes("Unknown"),
    r.stderr,
  );
});

