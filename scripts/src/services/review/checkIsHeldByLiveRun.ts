// Whether an issue belongs to another run that is still going, so that run's own fixer or settle job may still be on it.
// The status is read only for such a run: an issue with no run, or this run's own, is never held.
export const checkIsHeldByLiveRun = (
  issueRunId: string,
  currentRunId: string,
  getRunStatus: (runId: string) => string,
): boolean => issueRunId !== "" && issueRunId !== currentRunId && getRunStatus(issueRunId) !== "completed";
