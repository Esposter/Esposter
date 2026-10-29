import { runToolAsync } from "#src/services/resume/runToolAsync";
import { getResultAsync } from "@esposter/shared";

// The failed steps' lines of a job. `gh` reads them out of the run's log archive, which GitHub sometimes serves broken,
// So the job's whole log, the same lines with the passing steps' among them, is read in its place
export const readFailedJobLog = async (jobId: string): Promise<string> => {
  const failedStepsLog = await getResultAsync(() =>
    runToolAsync("gh", ["run", "view", "--job", jobId, "--log-failed"]),
  ).match(
    (log) => log,
    (error) => {
      console.log(`Job ${jobId}'s failed steps could not be read (${error.message}), so its whole log is read`);
      return undefined;
    },
  );
  if (failedStepsLog !== undefined) return failedStepsLog;
  // A job's whole log can outgrow the read too, a coverage shard's among them, so a log neither read returns is said in
  // One line in its place, and the run's verdict and its other jobs are printed all the same
  return getResultAsync(() => runToolAsync("gh", ["api", `repos/{owner}/{repo}/actions/jobs/${jobId}/logs`])).match(
    (log) => log,
    (error) => `error: job ${jobId}'s log could not be read (${error.message}); open it on GitHub`,
  );
};
