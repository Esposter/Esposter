import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("coderabbitPlan", () => {
  // The prose that operates the budget — the skill a session reads, the docs that record the collector and the
  // README's overview of it. A number written there drifts silently when the plan moves, which is the one failure
  // Nothing downstream reports: a page saying "100 files" beside a constant saying 150, or "one slot per hour"
  // Beside a plan allowing five, breaks no test and no build
  // `git ls-files` matches a glob at any depth, so the skill's references are covered by its own entry
  const PROSE_GLOBS = [
    ".agents/skills/coderabbit/*.md",
    ".agents/skills/review-queue/*.md",
    "apps/web/content/docs/infra/review-collector/*.md",
    "README.md",
  ];
  const FILE_NUMBER_REGEX = /\b\d+[- ]files?\b|\bfiles? or \d+\b|\bcap of \d+\b/u;
  const HOURLY_NUMBER_REGEX =
    /\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten) (?:reviews?|slots?|windows?|pull requests?) (?:an|a|per) hour\b/iu;

  test("no prose restates the plan's figures as a number", () => {
    expect.hasAssertions();

    const offenders = readSweepFilePaths(...PROSE_GLOBS).flatMap((path) =>
      readFileSync(join(REPOSITORY_ROOT, path), "utf8")
        .split("\n")
        .flatMap((line, index) =>
          FILE_NUMBER_REGEX.test(line) || HOURLY_NUMBER_REGEX.test(line) ? [`${path}:${index + 1}`] : [],
        ),
    );

    expect(offenders).toStrictEqual([]);
  });
});
