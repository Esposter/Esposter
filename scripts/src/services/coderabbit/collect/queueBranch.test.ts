import {
  CI_FAILURE_CONCLUSION,
  MAIN_BRANCH,
  MAIN_CHECK_WORKFLOW_FILES,
  QUEUE_BRANCH,
} from "#src/services/coderabbit/collect/constants";
import { readWorkflowLines } from "#src/services/coderabbit/collect/readWorkflowLines.test";
import { describe, expect, test } from "vitest";

describe("queueBranch", () => {
  // The runner pins everything but its triggers to the queue head, whichever event fired it: the trigger file
  // Calls the reusable workflow at that ref, the reusable workflow checks it out, and its retrigger and its guard
  // Dispatch it. A workflow file cannot import the constant, so every place the two files spell the branch is pinned
  // Here — a rename that moves the constant and not the files would have the runner call and check out a branch that
  // No longer exists, which is the deadlock the pin exists to close.
  test.each([
    ["the queue push trigger", "ReviewCollector.yaml", `      - ${QUEUE_BRANCH}`],
    [
      "the reusable workflow's ref",
      "ReviewCollector.yaml",
      `    uses: Esposter/Esposter/.github/workflows/run-review-collector.yaml@${QUEUE_BRANCH}`,
    ],
    ["the checkout ref", "run-review-collector.yaml", `          ref: ${QUEUE_BRANCH}`],
  ])("the runner spells %s as the constant", (_title, name, line) => {
    expect.hasAssertions();

    expect(readWorkflowLines(name)).toContain(line);
  });

  // Two jobs wake the cycle — the retrigger and the guard — and a containment check passes while either one still
  // Spells the constant, so every dispatch line is read
  test("the runner dispatches the cycle at the constant from every job that wakes it", () => {
    expect.hasAssertions();

    const dispatchLine = `        run: until gh workflow run ReviewCollector.yaml --repo "$GITHUB_REPOSITORY" --ref ${QUEUE_BRANCH}; do sleep 60; done`;

    expect(
      readWorkflowLines("run-review-collector.yaml").filter((line) => line.includes("gh workflow run")),
    ).toStrictEqual([dispatchLine, dispatchLine]);
  });

  // The repairer reads a verdict on `main`'s head by the workflow file, and the trigger that fires it names
  // The same workflow by its display name: the one is the other's first line
  test.each(MAIN_CHECK_WORKFLOW_FILES)("the repair trigger names %s, which the cycle reads", (workflowFile) => {
    expect.hasAssertions();

    const [nameLine = ""] = readWorkflowLines(workflowFile);

    expect(readWorkflowLines("ReviewCollector.yaml")).toContain(`      - ${nameLine.replace("name: ", "")}`);
    expect(readWorkflowLines("run-review-collector.yaml")).toContain(
      `      (github.event.workflow_run.head_repository.full_name == github.repository && github.event.workflow_run.head_branch == '${MAIN_BRANCH}' && github.event.workflow_run.conclusion == '${CI_FAILURE_CONCLUSION}'))`,
    );
  });
});
