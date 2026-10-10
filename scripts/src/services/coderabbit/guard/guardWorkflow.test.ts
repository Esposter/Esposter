import { readWorkflowLines } from "#src/services/coderabbit/collect/readWorkflowLines.test";
import {
  COLLECT_JOB_NAME,
  COLLECTOR_WORKFLOW_FILE,
  IS_WAKING_OUTPUT,
  SETUP_STEP_NAMES,
} from "#src/services/coderabbit/guard/constants";
import { describe, expect, test } from "vitest";

describe("guardWorkflow", () => {
  const runnerName = "run-review-collector.yaml";

  // A workflow file cannot import the constants, so each place the guard reads one is pinned here: a job renamed on
  // Either side would have the guard find no collect job in any run, and an output renamed would wake the cycle after
  // Every red, the streak it read thrown away
  test("finds the collect job under the name the caller's job and the called one join to", () => {
    expect.hasAssertions();

    const [callerJobName, calledJobName] = COLLECT_JOB_NAME.split(" / ");

    expect(readWorkflowLines(COLLECTOR_WORKFLOW_FILE)).toContain(`    name: ${callerJobName ?? ""}`);
    expect(readWorkflowLines(runnerName)).toContain(`    name: ${calledJobName ?? ""}`);
  });

  test("wakes the cycle on the output the guard writes, in both steps that wake it", () => {
    expect.hasAssertions();

    const wakeLine = `        if: \${{ !cancelled() && steps.streak.outputs.${IS_WAKING_OUTPUT} != 'false' }}`;

    expect(readWorkflowLines(runnerName).filter((line) => line.includes("steps.streak.outputs"))).toStrictEqual([
      wakeLine,
      wakeLine,
    ]);
  });

  // A setup step renamed would have its red counted towards the shorter streak, the cycle held on a checkout GitHub
  // Failed for a while
  test.each([...SETUP_STEP_NAMES])(
    "counts a red in the collect job's %s step towards the setup's streak",
    (stepName) => {
      expect.hasAssertions();

      const lines = readWorkflowLines(runnerName);

      expect(lines.slice(lines.indexOf("  collect:"), lines.indexOf("  retrigger:"))).toContain(
        `      - name: ${stepName}`,
      );
    },
  );
});
