import type { SetupSyntaxSuiteOptions } from "#src/models/SetupSyntaxSuiteOptions";

import { ESLint } from "eslint";
// oxlint-disable-next-line no-restricted-imports -- shared-node depends on this package, so this test's own spawn passes windowsHide, as the wrapper does
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

interface VizeLintReport {
  file: string;
  messages: { message: string }[];
}
// Every ban here is one entry in a list the configs spread into one or more overrides, so a fixture is linted through
// The real configs rather than the entry alone: that is what proves the selector parses, that its override reaches the
// File kind it names, and that a later override has not replaced it. A script is ESLint's and a template is vize's, run
// From the repository root so it reads the root `vite.config.ts`, so a component fixture goes through both. Each is
// Loaded once per suite, and only the entries under test are counted, so a fixture may break any other rule freely.
// Only the restricted-syntax and restricted-import rules run in ESLint: the UnoCSS ones load a `uno.config.ts` this
// Package has none of, and throw on any template carrying an attribute.
export const setupSyntaxSuite = ({ entries, fixtures }: SetupSyntaxSuiteOptions): void => {
  const PACKAGE_ROOT = join(import.meta.dirname, "..", "..");
  const REPOSITORY_ROOT = join(PACKAGE_ROOT, "..", "..");
  const messages = [...new Set(entries.map(({ message }) => message))];
  const countEntryMessages = (reportedMessages: { message: string }[]) =>
    // A restricted import or a vize finding prefixes the entry's message, so an entry matches by its end
    reportedMessages.filter(({ message }) => messages.some((entry) => message.endsWith(entry))).length;
  const fixtureViolationsMap = new Map<string, number>();
  const componentFixtures = fixtures.filter(({ filePath }) => filePath.endsWith(".vue"));
  let templateRoot = "";

  beforeAll(async () => {
    const eslint = new ESLint({
      cwd: PACKAGE_ROOT,
      overrideConfigFile: "eslint/index.vue.js",
      ruleFilter: ({ ruleId }) => ruleId.endsWith("no-restricted-syntax") || ruleId.endsWith("no-restricted-imports"),
    });
    await Promise.all(
      fixtures.map(async ({ filePath, name, source }) => {
        const [result] = await eslint.lintText(`${source}\n`, { filePath });
        fixtureViolationsMap.set(name, countEntryMessages(result?.messages ?? []));
      }),
    );
    if (componentFixtures.length === 0) return;

    templateRoot = mkdtempSync(join(tmpdir(), "syntax-suite-"));
    const componentPaths = componentFixtures.map(({ name, source }) => {
      const componentPath = join(templateRoot, `${name}.vue`);
      writeFileSync(componentPath, `${source}\n`);
      return componentPath;
    });
    const { stdout } = spawnSync(
      process.execPath,
      [join(REPOSITORY_ROOT, "node_modules", "vize", "bin", "vize"), "lint", "--format", "json", ...componentPaths],
      { cwd: REPOSITORY_ROOT, encoding: "utf8", windowsHide: true },
    );
    for (const { file, messages: reportedMessages } of JSON.parse(stdout) as VizeLintReport[]) {
      const name = basename(file, ".vue");
      fixtureViolationsMap.set(name, (fixtureViolationsMap.get(name) ?? 0) + countEntryMessages(reportedMessages));
    }
  });

  afterAll(() => {
    if (templateRoot) rmSync(templateRoot, { force: true, recursive: true });
  });

  test.each(fixtures)("reports $violations violation(s) for $name", ({ name, violations }) => {
    expect.hasAssertions();

    expect(fixtureViolationsMap.get(name)).toBe(violations);
  });
};

describe.todo("setupSyntaxSuite");
