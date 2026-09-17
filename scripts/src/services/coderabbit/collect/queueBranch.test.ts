import {
  CI_FAILURE_CONCLUSION,
  CI_WORKFLOW_FILE,
  MAIN_BRANCH,
  QUEUE_BRANCH,
} from "#src/services/coderabbit/collect/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const readWorkflowLines = (name: string): string[] =>
  readFileSync(join(REPOSITORY_ROOT, ".github/workflows", name), "utf8").split(/\r?\n/u);

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
  ])("the runner spells %s as the constant", (_title, name, line) => {
    expect.hasAssertions();

    expect(readWorkflowLines(name)).toContain(line);
  });

  // The repairer reads CI's verdict on `main`'s head by the workflow file, and the trigger that fires it names
  // The same workflow by its display name: the one is the other's first line
  test("the repair trigger names the workflow the cycle reads", () => {
    expect.hasAssertions();

    const [nameLine = ""] = readWorkflowLines(CI_WORKFLOW_FILE);

    expect(readWorkflowLines("ReviewCollector.yaml")).toContain(`      - ${nameLine.replace("name: ", "")}`);
    expect(readWorkflowLines("run-review-collector.yaml")).toContain(
      `      (github.event.workflow_run.head_branch == '${MAIN_BRANCH}' && github.event.workflow_run.conclusion == '${CI_FAILURE_CONCLUSION}'))`,
    );
  });
});
