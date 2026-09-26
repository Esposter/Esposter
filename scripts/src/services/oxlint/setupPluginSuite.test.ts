import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { InvalidOperationError, jsonDateParse, Operation } from "@esposter/shared";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

interface OxlintFixture {
  name: string;
  source: string;
  violations: number;
}

interface SetupOxlintPluginSuiteOptions {
  // The extension fixtures are written with, for a rule whose subject only exists in one file type
  extension?: string;
  fixtures: OxlintFixture[];
  // The plugin entrypoint's file name without its extension, under `scripts/src/oxlint/`
  plugin: string;
  rules: string[];
  // A rule that only sees a construct inside a function frame needs its fixture bodies wrapped in one
  wrapSource?: (source: string) => string;
}

const OXLINT_BIN = join(REPOSITORY_ROOT, "node_modules", "oxlint", "bin", "oxlint");
// The plugin entrypoints stay where `oxlint.config.ts` loads them from, and the suite drives the same file the
// Config does rather than the rule modules under `services/`
const PLUGINS_DIRECTORY = join(REPOSITORY_ROOT, "scripts", "src", "oxlint");
const TEMPORARY_DIRECTORY_PREFIX = "oxlint-plugin-";

// A rule only exists as an oxlint JS plugin and @oxlint/plugins ships no RuleTester, so a suite drives the
// Real oxlint binary over generated fixtures — which covers plugin loading and visitor keys, not just the
// Predicates. Fixtures are written outside the repo so the deliberately-violating ones are never picked up by
// The root lint pass. One oxlint pass answers for every fixture, so the whole thing happens once in `beforeAll`.
// The two tests every plugin suite asks are registered here as well: each fixture's violation count, and that
// The pass reported every rule under test and nothing else — so a suite is its fixture table and this call
export const setupPluginSuite = ({
  extension = ".ts",
  fixtures,
  plugin,
  rules,
  wrapSource = (source) => source,
}: SetupOxlintPluginSuiteOptions): void => {
  const fixtureViolationsMap = new Map<string, number>();
  let directory = "";
  let codes: string[] = [];

  beforeAll(() => {
    directory = mkdtempSync(join(tmpdir(), TEMPORARY_DIRECTORY_PREFIX));
    writeFileSync(
      join(directory, "oxlint.config.ts"),
      JSON.stringify({
        categories: {},
        jsPlugins: [join(PLUGINS_DIRECTORY, `${plugin}.ts`).replaceAll("\\", "/")],
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
        join(directory, "oxlint.config.ts"),
        "--format=json",
        "--disable-nested-config",
        directory,
      ],
      { encoding: "utf8" },
    );
    if (!stdout)
      throw new InvalidOperationError(
        Operation.Read,
        plugin,
        `oxlint produced no output (status ${status}): ${stderr}`,
      );

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

  test.each(fixtures)("reports $violations violation(s) for $name", ({ name, violations }) => {
    expect.hasAssertions();

    expect(fixtureViolationsMap.get(name)).toBe(violations);
  });

  test("reports every rule under test and nothing else", () => {
    expect.hasAssertions();

    // A diagnostic spells `plugin/rule` as `plugin(rule)`
    const expectedCodes = rules
      .map((rule) => rule.replace(/^(?<pluginName>[^/]+)\/(?<ruleName>.+)$/u, "$<pluginName>($<ruleName>)"))
      .toSorted();
    expect([...new Set(codes)].toSorted()).toStrictEqual(expectedCodes);
  });
};

describe.todo("setupPluginSuite");
