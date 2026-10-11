import type { CiRun } from "#src/models/ci/CiRun";

import { UNSETTLED_CONCLUSIONS } from "#src/services/ci/constants";

// The run whose verdict covers the commit: its own run, unless that was superseded before it settled, in which case the
// Newest later run of the same workflow on the branch, which builds on the commit too. `undefined` when neither exists
export const selectRunToWatch = (commitRun: CiRun | undefined, branchRuns: CiRun[]): CiRun | undefined => {
  if (!commitRun) return undefined;
  if (!UNSETTLED_CONCLUSIONS.includes(commitRun.conclusion)) return commitRun;

  return branchRuns
    .filter(
      ({ conclusion, createdAt, workflowName }) =>
        workflowName === commitRun.workflowName &&
        createdAt > commitRun.createdAt &&
        !UNSETTLED_CONCLUSIONS.includes(conclusion),
    )
    .toSorted((firstRun, secondRun) => secondRun.createdAt.localeCompare(firstRun.createdAt))
    .at(0);
};
