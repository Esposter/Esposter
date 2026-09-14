import { QUEUE_BRANCH } from "#src/services/coderabbit/collect/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("queue branch", () => {
  // The runner pins the copy of the cycle it runs to the queue head, whichever event fired it: the alternative is
  // Each event running its own ref's copy, and the oldest of those reading remote state the newest wrote. A
  // Workflow file cannot import the constant, so the three places it spells the branch are pinned here instead —
  // A rename that moves the constant and not the file would have the runner check out a branch that no longer
  // Exists, which is the same deadlock the pin exists to close.
  const workflowLines = readFileSync(join(REPOSITORY_ROOT, ".github/workflows/ReviewCollector.yaml"), "utf8").split(
    /\r?\n/u,
  );

  test.each([
    ["the queue push trigger", `      - ${QUEUE_BRANCH}`],
    ["the checkout ref", `          ref: ${QUEUE_BRANCH}`],
    [
      "the retrigger's dispatch ref",
      `        run: gh workflow run ReviewCollector.yaml --repo "$GITHUB_REPOSITORY" --ref ${QUEUE_BRANCH}`,
    ],
  ])("the runner spells %s as the constant", (_, line) => {
    expect.hasAssertions();

    expect(workflowLines).toContain(line);
  });
});
