import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getSweepFilePaths } from "#src/services/sweeps/getSweepFilePaths";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("reviewFileCap", () => {
  // The prose that operates the budget — the skill a session reads and the docs that record the collector. A
  // Number written there drifts silently when the cap moves, which is the one failure nothing downstream
  // Reports: a page saying "100 files" beside a constant saying 150 breaks no test and no build
  // `git ls-files` matches a glob at any depth, so the skill's references are covered by its own entry
  const PROSE_GLOBS = [
    ".agents/skills/coderabbit/*.md",
    ".agents/skills/review-queue/*.md",
    "apps/web/content/docs/infra/review-collector/*.md",
  ];
  const FILE_NUMBER_REGEX = /\b\d+[- ]files?\b|\bfiles? or \d+\b|\bcap of \d+\b/u;

  test("no prose restates the cap as a number", () => {
    expect.hasAssertions();

    const offenders = getSweepFilePaths(...PROSE_GLOBS).flatMap((path) =>
      readFileSync(join(REPOSITORY_ROOT, path), "utf8")
        .split("\n")
        .flatMap((line, index) => (FILE_NUMBER_REGEX.test(line) ? [`${path}:${index + 1}`] : [])),
    );

    expect(offenders).toStrictEqual([]);
  });
});
