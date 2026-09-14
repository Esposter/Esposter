import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { OpenReleaseInput } from "#src/models/coderabbit/collect/OpenReleaseInput";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { DEVELOP_BRANCH, MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { runGh } from "#src/services/coderabbit/shared/runGh";
import { runGit } from "#src/services/coderabbit/shared/runGit";

// Opened once `develop` carries a window worth the slot — the same fill target a push clears, since opening is
// The first review of `main..develop`. Idempotent by predicate: the cycle reaches here only when none is open.
// Merging it stays a person's act — that is a release.
export const openReleasePullRequest = ({ cwd, developSha, isDryRun, mainSha }: OpenReleaseInput): CycleOutcome => {
  const subjects = runGit(["log", "--format=- %s", `${mainSha}..${developSha}`], cwd).trim();
  const title = `release: ${DEVELOP_BRANCH} → ${MAIN_BRANCH}`;
  const body = `Opened by the review collector at ${developSha}, once the window reached the fill target.\n\n${subjects}`;
  if (isDryRun) console.info(`would open the ${title} pull request`);
  else {
    runGh(["pr", "create", "--base", MAIN_BRANCH, "--head", DEVELOP_BRANCH, "--title", title, "--body", body]);
    console.info(`opened the ${title} pull request`);
  }
  return {
    kind: CycleOutcomeKind.Opened,
    reason: `the ${title} pull request is open — its first review reads the whole window`,
    targetSha: developSha,
  };
};
