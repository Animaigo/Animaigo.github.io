import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const readSource = (relativePath: string) => readFileSync(
  fileURLToPath(new URL(`../${relativePath}`, import.meta.url)),
  "utf8"
);

const profileSource = readSource("src/core/PerformanceProfile.astro");
const fuyukawaThemeSource = readSource("src/themes/fuyukawa-kagari/styles/theme.css");
const blankThemeSource = readSource("src/themes/blank/styles/theme.css");
const packageSource = readSource("package.json");
const budgetSource = readSource("scripts/check-performance-budgets.mjs");

test("shared performance profile publishes document visibility", () => {
  assert.match(profileSource, /root\.dataset\.yuimiVisibility = document\.visibilityState/);
  assert.match(profileSource, /document\.addEventListener\("visibilitychange", applyVisibility/);
});

test("kept themes pause CSS animation work while the document is hidden", () => {
  for (const source of [fuyukawaThemeSource, blankThemeSource]) {
    assert.match(source, /html\[data-yuimi-visibility="hidden"\][^]*animation-play-state: paused !important/);
  }
});

test("Fuyukawa lite mode removes persistent decorative motion", () => {
  assert.match(fuyukawaThemeSource, /data-yuimi-performance="lite"\] \.sakura-rain span[^]*animation: none !important/);
  assert.match(fuyukawaThemeSource, /data-yuimi-performance="lite"\] \.console-meter span[^]*animation: none !important/);
});

test("production build enforces route and CSS budgets", () => {
  const scripts = JSON.parse(packageSource).scripts;
  assert.equal(scripts.build, "npm run generate:assets && astro build && npm run check:performance");
  assert.equal(scripts["check:performance"], "node scripts/check-performance-budgets.mjs");
  assert.match(budgetSource, /Fuyukawa Home/);
  assert.match(budgetSource, /Fuyukawa About/);
  assert.match(budgetSource, /recordBudget\(`\$\{route\.label\} HTML`/);
});
