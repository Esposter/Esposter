import type { CiRun } from "#src/models/ci/CiRun";

import {
  BRANCH_RUN_LIMIT,
  CI_RUN_FIELDS,
  CI_WORKFLOW_FILE,
  RUN_CREATION_ATTEMPTS,
  RUN_CREATION_WAIT,
  RUN_WATCH_INTERVAL_SECONDS,
  UNSETTLED_CONCLUSIONS,
} from "#src/services/ci/constants";
import { getErrorLines } from "#src/services/ci/getErrorLines";
import { selectRunToWatch } from "#src/services/ci/selectRunToWatch";
import { runToolAsync } from "#src/services/resume/runToolAsync";
import { QUEUE_BRANCH } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResultAsync } from "@esposter/shared";
import { setTimeout as sleep } from "node:timers/promises";

interface CiJob {
  conclusion: string;
  databaseId: number;
  name: string;
}

// Found by its commit, never by `--branch` with `--workflow`: GitHub's per-workflow branch filter answers with weeks-old
// Runs for `ai/queue` (the `running-checks` skill, "Watching the push's run")
const readCommitRun = async (sha: string): Promise<CiRun | undefined> => {
  for (let attempt = 0; attempt < RUN_CREATION_ATTEMPTS; attempt++) {
    const [run] = parseMachineJson<CiRun[]>(
      // oxlint-disable-next-line no-await-in-loop -- each read waits for the one before it to find no run yet
      await runToolAsync("gh", [
        "run",
        "list",
        "--commit",
        sha,
        "--workflow",
        CI_WORKFLOW_FILE,
        "--limit",
        "1",
        "--json",
        CI_RUN_FIELDS,
      ]),
    );
    if (run) return run;
    // oxlint-disable-next-line no-await-in-loop -- the run is created after the push, with no event to wait on
    await sleep(RUN_CREATION_WAIT.total("milliseconds"));
  }
  return undefined;
};

const readBranchRuns = async (): Promise<CiRun[]> =>
  parseMachineJson<CiRun[]>(
    await runToolAsync("gh", [
      "run",
      "list",
      "--branch",
      QUEUE_BRANCH,
      "--limit",
      String(BRANCH_RUN_LIMIT),
      "--json",
      CI_RUN_FIELDS,
    ]),
  );

// The failed steps' lines of a job. `gh` reads them out of the run's log archive, which GitHub sometimes serves broken,
// So the job's whole log, the same lines with the passing steps' among them, is read in its place
const readFailedJobLog = async (jobId: string): Promise<string> => {
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

// Waits for the run until it completes, `--exit-status` left off so the watch ends whatever the conclusion, then reads it
const readCompletedRun = async (runId: string): Promise<{ conclusion: string; jobs: CiJob[] }> => {
  await runToolAsync("gh", ["run", "watch", runId, "--interval", String(RUN_WATCH_INTERVAL_SECONDS)]);
  return parseMachineJson<{ conclusion: string; jobs: CiJob[] }>(
    await runToolAsync("gh", ["run", "view", runId, "--json", "conclusion,jobs"]),
  );
};

// Waits for the CI run that covers `ai/queue`'s tip and prints its verdict, with each failed job's error lines. A run
// Superseded while it was watched carries no verdict, so the newer run after it, which builds on the tip too, is
// Watched in its place. Returns whether the verdict is a pass, so a red exits non-zero and wakes the session that pushed
export const watchQueueRun = async (): Promise<boolean> => {
  await runToolAsync("git", ["fetch", "-q", "origin", QUEUE_BRANCH]);
  const sha = (await runToolAsync("git", ["rev-parse", `origin/${QUEUE_BRANCH}`])).trim();
  let run = selectRunToWatch(await readCommitRun(sha), await readBranchRuns());
  let completedRun: undefined | { conclusion: string; jobs: CiJob[] };
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
    return false;
  }

  const { conclusion, jobs } = completedRun;
  console.log(`CI run ${run.databaseId} for ${sha.slice(0, 10)}: ${conclusion}`);
  const failedJobs = jobs.filter((job) => job.conclusion === "failure");
  const failedLogs = await Promise.all(failedJobs.map(({ databaseId }) => readFailedJobLog(String(databaseId))));
  for (const [index, { name }] of failedJobs.entries()) {
    console.log(`\n✖ ${name}`);
    for (const line of getErrorLines(failedLogs[index] ?? "")) console.log(`  ${line}`);
  }
  return conclusion === "success";
};
