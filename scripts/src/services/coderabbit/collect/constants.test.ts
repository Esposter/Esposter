import { QUEUE_BRANCH } from "#src/services/coderabbit/collect/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const readWorkflowLines = (name: string): string[] =>
  readFileSync(join(REPOSITORY_ROOT, ".github/workflows", name), "utf8").split(/\r?\n/u);

// The one file name the fixture repository tests write, distinguished by extension or nesting where two must coexist
export const TEST_FILENAME = "a";

// A fixture repository test is a dozen git processes, each a spawn on Windows
export const FIXTURE_TEST_TIMEOUT_MS: number = Temporal.Duration.from({ seconds: 60 }).total("milliseconds");

describe("queueBranch", () => {
  // The runner pins everything but its triggers to the queue head, whichever event fired it: the trigger file
  // Calls the reusable workflow at that ref, the reusable workflow checks it out, and its retrigger dispatches
  // It. A workflow file cannot import the constant, so every place the two files spell the branch is pinned here
  // — a rename that moves the constant and not the files would have the runner call and check out a branch that
  // No longer exists, which is the deadlock the pin exists to close.
  test.each([
    ["the queue push trigger", "ReviewCollector.yaml", `      - ${QUEUE_BRANCH}`],
    [
      "the reusable workflow's ref",
      "ReviewCollector.yaml",
      `    uses: Esposter/Esposter/.github/workflows/run-review-collector.yaml@${QUEUE_BRANCH}`,
    ],
    ["the checkout ref", "run-review-collector.yaml", `          ref: ${QUEUE_BRANCH}`],
    [
      "the retrigger's dispatch ref",
      "run-review-collector.yaml",
      `        run: gh workflow run ReviewCollector.yaml --repo "$GITHUB_REPOSITORY" --ref ${QUEUE_BRANCH}`,
    ],
  ])("the runner spells %s as the constant", (_, name, line) => {
    expect.hasAssertions();

    expect(readWorkflowLines(name)).toContain(line);
  });
});
