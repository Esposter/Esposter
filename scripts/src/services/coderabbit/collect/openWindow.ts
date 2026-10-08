import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { OpenWindowInput } from "#src/models/coderabbit/collect/OpenWindowInput";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { DEVELOP_BRANCH, WINDOW_TITLE } from "#src/services/coderabbit/collect/constants";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { getWindowBranch } from "#src/services/coderabbit/collect/getWindowBranch";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { readSha } from "#src/services/coderabbit/collect/readSha";
import { runGh } from "#src/services/shared/runGh";
import { runGit } from "#src/services/shared/runGit";

// One window cut at `targetSha`: its branch is pushed first, `develop` is fast-forwarded onto it, and the pull request
// Is opened over the window below. The branch push leases whatever sits on its name — nothing for a new window, the
// Head an earlier run pushed when that run died before opening it — so a dead run's window is taken over, never skipped.
export const openWindow = ({
  baseBranch,
  baseSha,
  cwd,
  developSha,
  isDryRun,
  targetSha,
  windowNumber,
}: OpenWindowInput): CycleOutcome => {
  const branch = getWindowBranch(windowNumber);
  const title = `${WINDOW_TITLE} ${windowNumber}`;
  // A number no pull request carries has no window behind it, so a branch already on it is a dead run's: its head need
  // not be an ancestor of this cut, and the lease alone guards the overwrite
  if (
    !pushBranch({
      branch,
      cwd,
      expectedSha: readSha(`origin/${branch}`, cwd),
      isDryRun,
      isRewrite: true,
      sha: targetSha,
    })
  )
    return getMovedOutcome(branch);
  if (!pushBranch({ branch: DEVELOP_BRANCH, cwd, expectedSha: developSha, isDryRun, sha: targetSha }))
    return getMovedOutcome(DEVELOP_BRANCH);

  const subjects = runGit(["log", "--format=- %s", `${baseSha}..${targetSha}`], cwd).trim();
  const body = `Opened by the review collector at ${targetSha}, over the window it had just pushed.\n\n${subjects}`;
  if (isDryRun) console.info(`would open ${title} over ${baseBranch}`);
  else {
    runGh(["pr", "create", "--base", baseBranch, "--head", branch, "--title", title, "--body", body]);
    console.info(`opened ${title} over ${baseBranch}`);
  }
  return {
    kind: CycleOutcomeKind.Opened,
    reason: `${title} is open over ${baseBranch} — its review reads only the commits above it`,
    targetSha,
  };
};
