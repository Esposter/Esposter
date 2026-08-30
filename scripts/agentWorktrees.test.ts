import { AGENT_WORKTREES_DIRECTORY } from "@esposter/configuration";
import { jsonDateParse } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * The configs below are JSON with no import mechanism, so they repeat the literal and these tests are the only
 * thing holding the copies to the owner — both have already been un-excluded once by an unrelated edit widening
 * a glob.
 */
describe(AGENT_WORKTREES_DIRECTORY, () => {
  const repositoryRoot = resolve(import.meta.dirname, "..");
  const readJson = (fileName: string): Record<string, unknown> =>
    jsonDateParse<Record<string, unknown>>(readFileSync(resolve(repositoryRoot, fileName), "utf8"));

  test("is excluded from the root typescript program", () => {
    expect.hasAssertions();

    expect(readJson("tsconfig.json").exclude).toContain(AGENT_WORKTREES_DIRECTORY);
  });

  // Oxlint's ignore list is also what governs ESLint's reach: the shared config builds from `.oxlintrc.json` via
  // `eslint-plugin-oxlint`'s `buildFromOxlintConfigFile`, which turns `ignorePatterns` into flat-config `ignores`.
  test("is excluded from the oxlint ignore patterns the shared eslint config bridges", () => {
    expect.hasAssertions();

    expect(readJson(".oxlintrc.json").ignorePatterns).toContain(AGENT_WORKTREES_DIRECTORY);
  });
});
