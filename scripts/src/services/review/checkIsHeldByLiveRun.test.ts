import { checkIsHeldByLiveRun } from "#src/services/review/checkIsHeldByLiveRun";
import { describe, expect, test, vi } from "vitest";

describe(checkIsHeldByLiveRun, () => {
  const currentRunId = "2";
  const otherRunId = "1";

  test("holds an issue of another run that is still going", () => {
    expect.hasAssertions();

    expect(checkIsHeldByLiveRun(otherRunId, currentRunId, () => "in_progress")).toBe(true);
  });

  test("does not hold an issue of a completed run", () => {
    expect.hasAssertions();

    expect(checkIsHeldByLiveRun(otherRunId, currentRunId, () => "completed")).toBe(false);
  });

  test("does not hold an issue with no run, or this run's own, without reading a status", () => {
    expect.hasAssertions();

    const getRunStatus = vi.fn<(runId: string) => string>(() => "in_progress");

    expect(checkIsHeldByLiveRun("", currentRunId, getRunStatus)).toBe(false);
    expect(checkIsHeldByLiveRun(currentRunId, currentRunId, getRunStatus)).toBe(false);
    expect(getRunStatus).not.toHaveBeenCalled();
  });
});
