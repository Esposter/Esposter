import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { ExpressLaneInput } from "#src/models/coderabbit/collect/ExpressLaneInput";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import {
  EXPRESS_FAILED_MARKER,
  EXPRESS_TRAILER,
  EXPRESS_VERIFY_COMMANDS,
  MAIN_BRANCH,
} from "#src/services/coderabbit/collect/constants";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { portExpress } from "#src/services/coderabbit/collect/portExpress";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { spawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";

// A red cut is told once on each commit it carried: the port never carries a commit claiming no review, so a
// Claim the checks refuse would otherwise sit in the queue unread and unsaid. The lane tries it again every run
// — a later commit reaching `main` may be what it needed — and a person drops the claim or repairs the commit.
const postRedCut = (shas: string[], viewerLogin: string): void => {
  for (const sha of shas) {
    const marker = getMarker(EXPRESS_FAILED_MARKER, sha);
    if (
      readEntries<GitHubEntry>(`commits/${sha}/comments`).some((comment) => checkIsMarked(comment, viewerLogin, marker))
    )
      continue;
    postCommitComment(
      sha,
      `${marker}\nThe express cut carrying this commit is red — its \`${EXPRESS_TRAILER}\` trailer claims no review, and the checks refused the cut. No window carries a claimed commit, so nothing behind it waits; drop the trailer to have it reviewed, or repair it. The lane tries again on every run.`,
    );
  }
};

// Build the cut, verify it, push it to `main`. `main` is production and the checks are the only gate a commit
// Claiming no review gets, so the cut earns every one CI would fail it on; a red one is told on its commits and
// Tried again next run. A push is the run's one irreversible act, so a lane that pushed ends the run.
export const runExpressLane = ({
  cwd,
  isDryRun,
  viewerLogin,
  ...expressInput
}: ExpressLaneInput): CycleOutcome | undefined => {
  const { shas, targetSha } = portExpress({ cwd, ...expressInput });
  if (targetSha === undefined) return undefined;

  console.info(`express: ${shas.length} commits claim nothing in them to review`);
  // A dry run reports the cut and carries on rather than ending here: nothing it does is irreversible, so the one
  // Pass is worth every stage's decision — the cut, the reshaping, the window — instead of only the first
  if (isDryRun) {
    console.info(`express: would verify and push ${targetSha} to ${MAIN_BRANCH}`);
    return undefined;
  } else if (
    !EXPRESS_VERIFY_COMMANDS.every((args) => {
      console.info(`verify: pnpm ${args.join(" ")}`);
      return spawnPnpm(args, { cwd, stdio: "inherit" }).status === 0;
    })
  ) {
    console.info("the express cut is red — told on its commits, tried again next run");
    postRedCut(shas, viewerLogin);
    return undefined;
  } else if (!pushBranch({ branch: MAIN_BRANCH, cwd, expectedSha: expressInput.mainSha, isDryRun, sha: targetSha }))
    return getMovedOutcome(MAIN_BRANCH);
  return {
    kind: CycleOutcomeKind.Expressed,
    reason: `${shas.length} express commits reached ${MAIN_BRANCH}`,
    targetSha,
  };
};
