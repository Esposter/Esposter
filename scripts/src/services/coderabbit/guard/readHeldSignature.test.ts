import type { CollectorJobView } from "#src/models/coderabbit/guard/CollectorJobView";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import { CI_FAILURE_CONCLUSION } from "#src/services/coderabbit/collect/constants";
import { getFailureSignature } from "#src/services/coderabbit/collect/getFailureSignature";
import {
  CI_SUCCESS_CONCLUSION,
  COLLECT_JOB_NAME,
  FAILURE_ANNOTATION_LEVEL,
  RUN_SKIPPED_CONCLUSION,
} from "#src/services/coderabbit/guard/constants";
import { readHeldSignature } from "#src/services/coderabbit/guard/readHeldSignature";
import { describe, expect, test, vi } from "vitest";

const { runGh } = vi.hoisted(() => ({ runGh: vi.fn<typeof baseRunGh>() }));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

// Each run by its id, newest first: its collect job's conclusion — or the run's own, when the caller's filter skipped
// It — and the error line a red one left
const answerRuns = (runs: { conclusion: string; line: string }[]): void => {
  const getJob = (databaseId: number): CollectorJobView => ({
    conclusion: runs[databaseId]?.conclusion ?? "",
    databaseId,
    name: COLLECT_JOB_NAME,
    steps: [{ conclusion: runs[databaseId]?.conclusion ?? "", name: "" }],
  });
  runGh.mockImplementation((args) => {
    if (args[1] === "list")
      return JSON.stringify(
        runs.map(({ conclusion }, databaseId) => ({
          conclusion: conclusion === RUN_SKIPPED_CONCLUSION ? conclusion : "",
          databaseId,
        })),
      );
    else if (args[1] === "view") return JSON.stringify({ jobs: [getJob(Number(args[2]))] });
    const databaseId = Number(args[1]?.split("/").at(-2));
    return JSON.stringify([
      { annotation_level: FAILURE_ANNOTATION_LEVEL, message: runs[databaseId]?.line ?? "", start_line: 0 },
    ]);
  });
};

describe(readHeldSignature, () => {
  const red = { conclusion: CI_FAILURE_CONCLUSION, line: "" };

  // A run the filter skipped, and one superseded while pending, ended neither green nor red, so the streak reads past
  // Them; the run the guard belongs to is still going, and its collect job is the newest red
  test("holds on the red the newest runs all failed on, reading past runs that ran nothing", () => {
    expect.hasAssertions();

    answerRuns([
      red,
      { conclusion: RUN_SKIPPED_CONCLUSION, line: "" },
      { conclusion: "cancelled", line: "" },
      red,
      red,
    ]);

    expect(readHeldSignature()).toStrictEqual(getFailureSignature("", [red.line]));
  });

  test.each([
    ["a run between them succeeded", [red, { conclusion: CI_SUCCESS_CONCLUSION, line: "" }, red, red]],
    ["they failed on different lines", [red, { ...red, line: " " }, red]],
    ["fewer of them failed than the streak", [red, red]],
  ])("holds nothing when %s", (_title, runs) => {
    expect.hasAssertions();

    answerRuns(runs);

    expect(readHeldSignature()).toBeUndefined();
  });
});
