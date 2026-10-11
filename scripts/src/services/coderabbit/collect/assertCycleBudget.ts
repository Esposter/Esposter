import { CycleBudgetSpentError } from "#src/models/coderabbit/collect/CycleBudgetSpentError";
import { CYCLE_BUDGET_MS, JOB_STARTED_AT_ENVIRONMENT_VARIABLE } from "#src/services/coderabbit/collect/constants";

const getMinutes = (milliseconds: number): number =>
  Math.ceil(Temporal.Duration.from({ milliseconds }).total("minutes"));
// Asked before a session launches, with the longest that session may run: one that could end past the run's budget
// Never starts, since the job's timeout would kill the run mid-session and leave it no retrigger. Read off the start
// The job's first step records, so the setup steps before the cycle are spent from it too
export const assertCycleBudget = (sessionCapMs: number): void => {
  const startedAt = process.env[JOB_STARTED_AT_ENVIRONMENT_VARIABLE];
  if (!startedAt) return;

  const elapsedMs = Date.now() - Number(startedAt);
  if (elapsedMs + sessionCapMs > CYCLE_BUDGET_MS)
    throw new CycleBudgetSpentError(
      `the run has spent ${getMinutes(elapsedMs)} of its ${getMinutes(CYCLE_BUDGET_MS)} minutes, too few for a session of up to ${getMinutes(sessionCapMs)}`,
    );
};
