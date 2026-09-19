import type { ExpressLaneInput } from "#src/models/coderabbit/collect/ExpressLaneInput";
import type { ExpressLaneResult } from "#src/models/coderabbit/collect/ExpressLaneResult";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { checkIsGreen } from "#src/services/coderabbit/collect/checkIsGreen";
import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import {
  EXPRESS_FAILED_MARKER,
  EXPRESS_TRAILER,
  MAIN_BRANCH,
  REPAIR_FAILED_MARKER,
} from "#src/services/coderabbit/collect/constants";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { portExpress } from "#src/services/coderabbit/collect/portExpress";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { readClaimedShas } from "#src/services/coderabbit/collect/readClaimedShas";
import { repairMain } from "#src/services/coderabbit/collect/repairMain";
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
// Tried again next run. A push is the run's one irreversible act, so a lane that pushed ends the run. The cut
// Goes first even over a red `main`: a claimed commit may be the repair — a session's own, or a person's past
// The repairer's attempts — and it reaches `main` this way alone. Only a red cut, or no cut, asks whether `main`
// Itself is red, and a red under repair is answered by the repairer's cut before any claimed commit is blamed.
export const runExpressLane = async ({
  cwd,
  isDryRun,
  viewerLogin,
  ...expressInput
}: ExpressLaneInput): Promise<ExpressLaneResult> => {
  const { mainSha } = expressInput;
  const claimedShas = readClaimedShas({ cwd, ...expressInput });
  const cut = claimedShas.length === 0 ? undefined : portExpress({ cwd, mainSha, shas: claimedShas });
  if (cut?.targetSha !== undefined) {
    console.info(`express: ${cut.shas.length} commits claim nothing in them to review`);
    // A dry run reports the cut and carries on rather than ending here: nothing it does is irreversible, so the
    // One pass is worth every stage's decision — the cut, the reshaping, the window — instead of only the first
    if (isDryRun) {
      console.info(`express: would verify and push ${cut.targetSha} to ${MAIN_BRANCH}`);
      return { heldShas: [] };
    } else if (checkIsGreen(cwd)) {
      if (!pushBranch({ branch: MAIN_BRANCH, cwd, expectedSha: mainSha, isDryRun, sha: cut.targetSha }))
        return { heldShas: claimedShas, outcome: getMovedOutcome(MAIN_BRANCH) };
      return {
        heldShas: [],
        outcome: {
          kind: CycleOutcomeKind.Expressed,
          reason: `${cut.shas.length} express commits reached ${MAIN_BRANCH}`,
          targetSha: cut.targetSha,
        },
      };
    }
    console.info("the express cut is red");
  }

  const repair = await repairMain({ cwd, isDryRun, mainSha, viewerLogin });
  if (repair.targetSha !== undefined) {
    // A repair that proved itself green before committing is not put through the same suite again
    if (!repair.isVerified && !checkIsGreen(cwd)) {
      console.info(`the repair is red — counted on ${MAIN_BRANCH}'s head, tried again next run`);
      postCommitComment(
        mainSha,
        `${getMarker(REPAIR_FAILED_MARKER, mainSha)}\nThe repair of this red ${MAIN_BRANCH} head failed the checks as a cut — see the collector run.`,
      );
      return { heldShas: claimedShas };
    } else if (!pushBranch({ branch: MAIN_BRANCH, cwd, expectedSha: mainSha, isDryRun, sha: repair.targetSha }))
      return { heldShas: claimedShas, outcome: getMovedOutcome(MAIN_BRANCH) };
    return {
      heldShas: [],
      outcome: {
        kind: CycleOutcomeKind.Repaired,
        reason: `${MAIN_BRANCH} repaired — the push runs the cycle again, which cuts the ${claimedShas.length} claimed commits behind it`,
        targetSha: repair.targetSha,
      },
    };
  } else if (repair.isUnderRepair) {
    // A red cut over a red `main` under repair is the red of neither claimed commit, and is not told on them
    if (claimedShas.length > 0)
      console.info(`express: ${claimedShas.length} claimed commits wait on the red ${MAIN_BRANCH}`);
    return { heldShas: claimedShas };
  } else if (cut?.targetSha !== undefined) {
    console.info("the express cut is red — told on its commits, tried again next run");
    postRedCut(cut.shas, viewerLogin);
  }
  // A claimed commit whose patch did not apply waits on the unported work it needs, and is not told: the next
  // Window may carry that work
  return { heldShas: claimedShas };
};
