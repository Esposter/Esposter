import { AGENT_ALIAS_DIRECTORY, AGENT_DIRECTORY, AGENT_WORKTREES_DIRECTORY } from "@esposter/configuration";
import { jsonDateParse } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * The configs below are JSON and gitignore syntax with no import mechanism, so they repeat the literal and these
 * tests are the only thing holding the copies to the owner — two of them have already been un-excluded once by an
 * unrelated edit widening a glob. ESLint states neither literal: the shared config bridges `.oxlintrc.json`'s
 * `ignorePatterns` into flat-config global `ignores` through `eslint-plugin-oxlint`, so the oxlint assertions
 * cover both linters.
 */
describe(AGENT_DIRECTORY, () => {
  const repositoryRoot = resolve(import.meta.dirname, "..");
  const readJson = (fileName: string): Record<string, unknown> =>
    jsonDateParse<Record<string, unknown>>(readFileSync(resolve(repositoryRoot, fileName), "utf8"));
  const readGitignorePatterns = (): string[] =>
    readFileSync(resolve(repositoryRoot, ".gitignore"), "utf8")
      .split("\n")
      .map((line) => line.trim());

  // Only a tool that follows directory symlinks enumerates the tree a second time under the alias, which is why
  // Absent here and present below: oxfmt and git.
  describe(AGENT_ALIAS_DIRECTORY, () => {
    test("is excluded from the root typescript program", () => {
      expect.hasAssertions();

      expect(readJson("tsconfig.json").exclude).toContain(AGENT_ALIAS_DIRECTORY);
    });

    test("is excluded from the oxlint ignore patterns the shared eslint config bridges", () => {
      expect.hasAssertions();

      expect(readJson(".oxlintrc.json").ignorePatterns).toContain(AGENT_ALIAS_DIRECTORY);
    });
  });

  describe(AGENT_WORKTREES_DIRECTORY, () => {
    test("is excluded from the root typescript program", () => {
      expect.hasAssertions();

      expect(readJson("tsconfig.json").exclude).toContain(AGENT_WORKTREES_DIRECTORY);
    });

    test("is excluded from the oxlint ignore patterns the shared eslint config bridges", () => {
      expect.hasAssertions();

      expect(readJson(".oxlintrc.json").ignorePatterns).toContain(AGENT_WORKTREES_DIRECTORY);
    });

    // A format run reaches further than a lint run: oxfmt rewrites what it walks, so a live worktree would have
    // Another branch's files reformatted in place.
    test("is excluded from the formatter", () => {
      expect.hasAssertions();

      expect(readJson(".oxfmtrc.json").ignorePatterns).toContain(AGENT_WORKTREES_DIRECTORY);
    });

    // The agent harness writes `.git/info/exclude`, which is machine-local — no clone or CI runner has it, so the
    // Checked-in ignore is what keeps a worktree out of `git status` everywhere else.
    test("is excluded from git", () => {
      expect.hasAssertions();

      expect(readGitignorePatterns()).toContain(AGENT_WORKTREES_DIRECTORY);
    });
  });
});
