import type { ReviewRunJob } from "#src/models/review/ReviewRunJob";

import { checkIsHeldByLiveRun } from "#src/services/review/checkIsHeldByLiveRun";
import { REVIEW_JOB_NAME } from "#src/services/review/constants";
import { getFixJobName } from "#src/services/review/getFixJobName";
import { describe, expect, test, vi } from "vitest";

describe(checkIsHeldByLiveRun, () => {
  const issue = 1;
  const currentRunId = "2";
  const otherRunId = "1";

  test("holds an issue while its run's review job or its own fix job runs", () => {
    expect.hasAssertions();

    expect(
      checkIsHeldByLiveRun(issue, otherRunId, currentRunId, () => [{ name: REVIEW_JOB_NAME, status: "in_progress" }]),
    ).toBe(true);
    expect(
      checkIsHeldByLiveRun(issue, otherRunId, currentRunId, () => [{ name: getFixJobName(issue), status: "queued" }]),
    ).toBe(true);
  });

  test("does not hold an issue once its fixer is done, while another issue's fixer or the settle job still runs", () => {
    expect.hasAssertions();

    const jobs: ReviewRunJob[] = [
      { name: REVIEW_JOB_NAME, status: "completed" },
      { name: getFixJobName(issue), status: "completed" },
      { name: getFixJobName(issue + 1), status: "in_progress" },
      { name: "Settle review issues", status: "in_progress" },
    ];

    expect(checkIsHeldByLiveRun(issue, otherRunId, currentRunId, () => jobs)).toBe(false);
  });

  test("does not hold an issue with no run, or this run's own, without reading its jobs", () => {
    expect.hasAssertions();

    const getRunJobs = vi.fn<(runId: string) => ReviewRunJob[]>(() => [
      { name: REVIEW_JOB_NAME, status: "in_progress" },
    ]);

    expect(checkIsHeldByLiveRun(issue, "", currentRunId, getRunJobs)).toBe(false);
    expect(checkIsHeldByLiveRun(issue, currentRunId, currentRunId, getRunJobs)).toBe(false);
    expect(getRunJobs).not.toHaveBeenCalled();
  });
});
