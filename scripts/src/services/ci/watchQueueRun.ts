import type { CiCompletedRun } from "#src/models/ci/CiCompletedRun";

import { FAILED_JOB_CONCLUSIONS, UNSETTLED_CONCLUSIONS } from "#src/services/ci/constants";
import { getErrorLines } from "#src/services/ci/getErrorLines";
import { readBranchRuns } from "#src/services/ci/readBranchRuns";
import { readCommitRun } from "#src/services/ci/readCommitRun";
import { readCompletedRun } from "#src/services/ci/readCompletedRun";
import { readFailedJobLog } from "#src/services/ci/readFailedJobLog";
import { selectRunToWatch } from "#src/services/ci/selectRunToWatch";
import { runToolAsync } from "#src/services/resume/runToolAsync";
import { QUEUE_BRANCH } from "#src/services/shared/constants";

// Waits for the CI run that covers `ai/queue`'s tip and prints its verdict, with each failed job's error lines. A run
// Superseded while it was watched carries no verdict, so the newer run after it, which builds on the tip too, is
// Watched in its place. Returns the verdict, or `none` while no run carries one, which is not a red, so the watch exits
// With its own code and only a red exits 1, waking the session that pushed
export const watchQueueRun = async (): Promise<"fail" | "none" | "pass"> => {
  await runToolAsync("git", ["fetch", "-q", "origin", QUEUE_BRANCH]);
  const sha = (await runToolAsync("git", ["rev-parse", `origin/${QUEUE_BRANCH}`])).trim();
  let run = selectRunToWatch(await readCommitRun(sha), await readBranchRuns());
  let completedRun: CiCompletedRun | undefined;
  while (run) {
    // oxlint-disable-next-line no-await-in-loop -- each run is watched only once the one before it was superseded
    completedRun = await readCompletedRun(String(run.databaseId));
    if (!UNSETTLED_CONCLUSIONS.includes(completedRun.conclusion)) break;

    console.log(`CI run ${run.databaseId} was ${completedRun.conclusion}, so the run after it is watched`);
    // oxlint-disable-next-line no-await-in-loop -- the runs after this one are read only once it was superseded
    run = selectRunToWatch({ ...run, conclusion: completedRun.conclusion }, await readBranchRuns());
  }
  if (!run || !completedRun) {
    console.log(`No CI run with a verdict covers ${sha} yet`);
    return "none";
  }

  const { conclusion, jobs } = completedRun;
  console.log(`CI run ${run.databaseId} for ${sha.slice(0, 10)}: ${conclusion}`);
  const failedJobs = jobs.filter((job) => FAILED_JOB_CONCLUSIONS.includes(job.conclusion));
  const failedLogs = await Promise.all(failedJobs.map(({ databaseId }) => readFailedJobLog(String(databaseId))));
  for (const [index, { name }] of failedJobs.entries()) {
    console.log(`\n✖ ${name}`);
    for (const line of getErrorLines(failedLogs[index] ?? "")) console.log(`  ${line}`);
  }
  return conclusion === "success" ? "pass" : "fail";
};
