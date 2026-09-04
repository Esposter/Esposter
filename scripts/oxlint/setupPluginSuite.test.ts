import { jsonDateParse } from "@esposter/shared";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { afterAll, beforeAll, describe } from "vitest";

interface OxlintFixture {
  name: string;
  source: string;
  violations: number;
}

interface SetupOxlintPluginSuiteOptions {
  // The extension fixtures are written with, for a rule whose subject only exists in one file type
  extension?: string;
  fixtures: OxlintFixture[];
  // The plugin module's file name without its extension — it sits beside this helper
  plugin: string;
  rules: string[];
  // A rule that only sees a construct inside a function frame needs its fixture bodies wrapped in one
  wrapSource?: (source: string) => string;
}

const OXLINT_BIN = join(import.meta.dirname, "..", "..", "node_modules", "oxlint", "bin", "oxlint");
const TEMPORARY_DIRECTORY_PREFIX = "oxlint-plugin-";

// A rule only exists as an oxlint JS plugin and @oxlint/plugins ships no RuleTester, so a suite drives the real
// Oxlint binary over generated fixtures — which covers plugin loading and visitor keys, not just the predicates.
// Fixtures are written outside the repo so the deliberately-violating ones are never picked up by the root
// Oxlint pass. One run answers for every fixture, so the whole thing happens once in `beforeAll`
export const setupPluginSuite = ({
  extension = ".ts",
  fixtures,
  plugin,
  rules,
  wrapSource = (source) => source,
}: SetupOxlintPluginSuiteOptions): {
  getCodes: () => string[];
  getViolations: (name: string) => number | undefined;
} => {
  const fixtureViolationsMap = new Map<string, number>();
  let directory = "";
  let codes: string[] = [];

  beforeAll(() => {
    directory = mkdtempSync(join(tmpdir(), TEMPORARY_DIRECTORY_PREFIX));
    writeFileSync(
      join(directory, ".oxlintrc.json"),
      JSON.stringify({
        categories: {},
        jsPlugins: [join(import.meta.dirname, `${plugin}.ts`).replaceAll("\\", "/")],
        plugins: [],
        rules: Object.fromEntries(rules.map((rule) => [rule, "error"])),
      }),
    );

    for (const { name, source } of fixtures)
      writeFileSync(join(directory, `${name}${extension}`), `${wrapSource(source)}\n`);

    const { status, stderr, stdout } = spawnSync(
      process.execPath,
      [
        OXLINT_BIN,
        "--config",
        join(directory, ".oxlintrc.json"),
        "--format=json",
        "--disable-nested-config",
        directory,
      ],
      { encoding: "utf8" },
    );
    if (!stdout) throw new Error(`oxlint produced no output (status ${status}): ${stderr}`);

    const { diagnostics } = jsonDateParse<{ diagnostics: { code: string; filename: string }[] }>(stdout);
    codes = diagnostics.map(({ code }) => code);

    for (const { name } of fixtures) fixtureViolationsMap.set(name, 0);
    for (const { filename } of diagnostics) {
      const name = basename(filename, extension);
      fixtureViolationsMap.set(name, (fixtureViolationsMap.get(name) ?? 0) + 1);
    }
  });

  afterAll(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  return { getCodes: () => codes, getViolations: (name: string) => fixtureViolationsMap.get(name) };
};

describe.todo("setupPluginSuite");
