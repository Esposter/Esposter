import type { ReviewRunJob } from "#src/models/review/ReviewRunJob";

import { REVIEW_JOB_NAME } from "#src/services/review/constants";
import { getFixJobName } from "#src/services/review/getFixJobName";

// Whether a fixer may still be on an issue: another run opened it, and that run's review job, which opens and lists its
// Issues, or the issue's own fix job has not completed. Another run's settle job holds nothing, since settle jobs share one
// Concurrency group and never overlap. The jobs are read only for another run, and a run that cannot be read has none.
export const checkIsHeldByLiveRun = (
  issue: number,
  issueRunId: string,
  currentRunId: string,
  getRunJobs: (runId: string) => ReviewRunJob[],
): boolean =>
  issueRunId !== "" &&
  issueRunId !== currentRunId &&
  getRunJobs(issueRunId).some(
    ({ name, status }) => status !== "completed" && (name === REVIEW_JOB_NAME || name === getFixJobName(issue)),
  );
