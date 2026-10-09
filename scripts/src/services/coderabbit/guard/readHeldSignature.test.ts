import type { CollectorJobView } from "#src/models/coderabbit/guard/CollectorJobView";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import { CI_FAILURE_CONCLUSION, CI_SUCCESS_CONCLUSION } from "#src/services/coderabbit/collect/constants";
import { getFailureSignature } from "#src/services/coderabbit/collect/getFailureSignature";
import {
  COLLECT_JOB_NAME,
  FAILURE_ANNOTATION_LEVEL,
  GUARD_RUN_LIST_LIMIT,
  RUN_CANCELLED_CONCLUSION,
  RUN_IN_PROGRESS_STATUS,
} from "#src/services/coderabbit/guard/constants";
import { readHeldSignature } from "#src/services/coderabbit/guard/readHeldSignature";
import { describe, expect, test, vi } from "vitest";

const { runGh } = vi.hoisted(() => ({ runGh: vi.fn<typeof baseRunGh>() }));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

// Each run by its id, newest first, answered as GitHub lists it: by state or conclusion, created since an instant, and
// No more than the limit asked for. A run carries its own conclusion — none while it is still going — its collect
// Job's, and the error line a red one left
const answerRuns = (runs: { conclusion: string; jobConclusion: string; line: string }[]): void => {
  const getCreatedAt = (databaseId: number): string => new Date(runs.length - databaseId).toISOString();
  const getJob = (databaseId: number): CollectorJobView => ({
    conclusion: runs[databaseId]?.jobConclusion ?? "",
    databaseId,
    name: COLLECT_JOB_NAME,
    steps: [{ conclusion: runs[databaseId]?.jobConclusion ?? "", name: "" }],
  });
  runGh.mockImplementation((args) => {
    const getOption = (name: string): string => (args.includes(name) ? (args[args.indexOf(name) + 1] ?? "") : "");
    if (args[1] === "list") {
      const status = getOption("--status");
      const createdSince = getOption("--created").replace(">=", "");
      return JSON.stringify(
        runs
          .map(({ conclusion }, databaseId) => ({ conclusion, createdAt: getCreatedAt(databaseId), databaseId }))
          .filter(
            ({ conclusion, createdAt }) =>
              (!status || (conclusion || RUN_IN_PROGRESS_STATUS) === status) &&
              (!createdSince || createdAt >= createdSince),
          )
          .slice(0, Number(getOption("--limit"))),
      );
    } else if (args[1] === "view") return JSON.stringify({ jobs: [getJob(Number(args[2]))] });
    const databaseId = Number(args[1]?.split("/").at(-2));
    return JSON.stringify([
      { annotation_level: FAILURE_ANNOTATION_LEVEL, message: runs[databaseId]?.line ?? "", start_line: 0 },
    ]);
  });
};

describe(readHeldSignature, () => {
  const red = { conclusion: CI_FAILURE_CONCLUSION, jobConclusion: CI_FAILURE_CONCLUSION, line: "" };
  const green = { conclusion: CI_SUCCESS_CONCLUSION, jobConclusion: CI_SUCCESS_CONCLUSION, line: "" };
  // The run the guard belongs to is still going, and its collect job is the newest red
  const ownRed = { ...red, conclusion: "" };
  // A fire superseded while pending, and an event the caller's filter skipped, neither of which ran the cycle
  const supersededRun = { conclusion: RUN_CANCELLED_CONCLUSION, jobConclusion: RUN_CANCELLED_CONCLUSION, line: "" };
  const skippedRun = { conclusion: "skipped", jobConclusion: "", line: "" };
  // A green collect job whose run reads as cancelled, since a newer run's guard replaced its waiting retrigger
  const supersededGreen = { ...green, conclusion: RUN_CANCELLED_CONCLUSION };
  // A red GitHub's rate limit caused, as Octokit words the refusal in an action's failure
  const rateLimitedRed = { ...red, line: "API rate limit exceeded for installation ID 1." };

  // Three in four runs are an event the filter skipped and most of the rest a fire superseded while pending, so a list
  // Of the newest runs held one collect job the streak could read
  test("holds on the red the newest runs all failed on, past more runs that ran nothing than one list reads", () => {
    expect.hasAssertions();

    answerRuns([ownRed, ...Array.from({ length: GUARD_RUN_LIST_LIMIT }, () => skippedRun), supersededRun, red, red]);

    expect(readHeldSignature()).toStrictEqual(getFailureSignature("", [red.line]));
  });

  // GitHub's rate limit lifts by itself, so a red it caused neither counts towards the streak nor ends it
  test("holds on the red the newest runs all failed on, past a red GitHub's rate limit caused", () => {
    expect.hasAssertions();

    answerRuns([ownRed, rateLimitedRed, red, red]);

    expect(readHeldSignature()).toStrictEqual(getFailureSignature("", [red.line]));
  });

  test.each([
    ["a run between them succeeded", [ownRed, green, red, red]],
    ["a run between them is still going after it succeeded", [ownRed, { ...green, conclusion: "" }, red, red]],
    ["a run between them succeeded before a newer one superseded it", [ownRed, red, supersededGreen, red, red]],
    [
      "more cancelled runs lie between them than one list reads",
      [ownRed, ...Array.from({ length: GUARD_RUN_LIST_LIMIT }, () => supersededRun), red, red],
    ],
    ["they failed on different lines", [ownRed, { ...red, line: " " }, red]],
    ["fewer of them failed than the streak", [ownRed, red]],
    ["GitHub's rate limit failed them all", [{ ...rateLimitedRed, conclusion: "" }, rateLimitedRed, rateLimitedRed]],
  ])("holds nothing when %s", (_title, runs) => {
    expect.hasAssertions();

    answerRuns(runs);

    expect(readHeldSignature()).toBeUndefined();
  });
});
