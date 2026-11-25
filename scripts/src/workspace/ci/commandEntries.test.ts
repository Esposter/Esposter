import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * Every CLI entry is a citty command started by the shared wrapper (`cli` skill), which times it, prints the time and
 * renders `--help`. A new entry is covered with no opt-in because the wrapper is the one way an entry starts; an entry
 * that calls `runMain` directly, or runs as a plain script, leaves its runs out of `{state-root}/timings` and is what
 * this test names.
 */
describe("commandEntries", () => {
  const ENTRY_PATHSPEC = "scripts/src/**/index.ts";
  const TIMED_REGEX = /\brunCommand\(/u;
  const RUN_MAIN_REGEX = /\brunMain\b/u;
  const entryPaths = readSweepFilePaths(ENTRY_PATHSPEC);

  test("every CLI entry starts through runCommand, never runMain", () => {
    expect.hasAssertions();

    const unwrappedPaths = entryPaths.filter((entryPath) => {
      const text = readFileSync(resolve(REPOSITORY_ROOT, entryPath), "utf8");
      return !TIMED_REGEX.test(text) || RUN_MAIN_REGEX.test(text);
    });

    expect(unwrappedPaths).toStrictEqual([]);
  });

  // The discovery above is the whole test's reach, so a pathspec matching nothing would pass vacuously.
  test("finds the entries", () => {
    expect.hasAssertions();

    expect(entryPaths.length).toBeGreaterThan(0);
  });
});
