import type { ExpressLaneInput } from "#src/models/coderabbit/collect/ExpressLaneInput";
import type { ExpressLaneResult } from "#src/models/coderabbit/collect/ExpressLaneResult";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { checkIsGreen } from "#src/services/coderabbit/collect/checkIsGreen";
import {
  EXPRESS_FAILED_MARKER,
  EXPRESS_TRAILER,
  MAIN_BRANCH,
  REPAIR_FAILED_MARKER,
  SESSION_ATTEMPT_CAP,
} from "#src/services/coderabbit/collect/constants";
import { getAttemptFailure } from "#src/services/coderabbit/collect/getAttemptFailure";
import { getMarkedCount } from "#src/services/coderabbit/collect/getMarkedCount";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { portExpress } from "#src/services/coderabbit/collect/portExpress";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { readClaimedShas } from "#src/services/coderabbit/collect/readClaimedShas";
import { readCommitComments } from "#src/services/coderabbit/collect/readCommitComments";
import { repairMain } from "#src/services/coderabbit/collect/repairMain";

// A red cut is counted on each commit it carried, against the `main` head it was checked on and the collector
// That checked it: the checks answer the same for the same tree, so a cut re-run over an unchanged `main` spends
// The whole suite on a red already known — once per queue push and per bot event, with no cap, was the cost of
// Retrying a claim that could not pass until something moved. What moves it is in the basis: `main` gaining the
// Commit the cut needed, or a collector fixed since. Past the cap against one basis the commit waits uncut, and
// A person drops the claim or repairs it; the port never carries a claimed commit, so nothing behind it waits.
const countRedCut = (shas: string[], shaAttemptsMap: Map<string, number>, basisShas: string[]): void => {
  for (const sha of shas)
    postCommitComment(
      sha,
      `${getAttemptFailure({
        attempts: shaAttemptsMap.get(sha) ?? 0,
        marker: getMarker(EXPRESS_FAILED_MARKER, sha, basisShas),
        task: `cut this commit onto \`${MAIN_BRANCH}\` unread`,
      })}\nIts \`${EXPRESS_TRAILER}\` trailer claims no review, and the checks refused the cut. No window carries a claimed commit, so nothing behind it waits; past the attempts against this \`${MAIN_BRANCH}\` head the cut waits until \`${MAIN_BRANCH}\` moves or the collector changes — drop the trailer to have it reviewed, or repair it.`,
    );
};

// Build the cut, verify it, push it to `main`. `main` is production and the checks are the only gate a commit
// Claiming no review gets, so the cut earns every one CI would fail it on; a red one is counted on its commits
// And tried again while its attempts against this head last. A push is the run's one irreversible act, so a lane
// That pushed ends the run. The cut goes first even over a red `main`: a claimed commit may be the repair — a
// Session's own, or a person's past the repairer's attempts — and it reaches `main` this way alone. Only a red
// Cut, or no cut, asks whether `main` itself is red, and a red under repair is answered by the repairer's cut
// Before any claimed commit is blamed.
export const runExpressLane = async ({
  collectorSha,
  cwd,
  isDryRun,
  viewerLogin,
  ...expressInput
}: ExpressLaneInput): Promise<ExpressLaneResult> => {
  const { mainSha } = expressInput;
  const basisShas = [collectorSha, mainSha];
  const claimedShas = readClaimedShas({ cwd, ...expressInput });
  const shaAttemptsMap = new Map(
    claimedShas.map((sha) => [
      sha,
      getMarkedCount(readCommitComments(sha), viewerLogin, getMarker(EXPRESS_FAILED_MARKER, sha, basisShas)),
    ]),
  );
  const cutShas = claimedShas.filter((sha) => (shaAttemptsMap.get(sha) ?? 0) < SESSION_ATTEMPT_CAP);
  if (cutShas.length < claimedShas.length)
    console.info(
      `express: ${claimedShas.length - cutShas.length} claimed commits wait past their attempts against ${MAIN_BRANCH} at ${mainSha}`,
    );
  const cut = cutShas.length === 0 ? undefined : portExpress({ cwd, mainSha, shas: cutShas });
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

  const repair = await repairMain({ collectorSha, cwd, isDryRun, mainSha, viewerLogin });
  if (repair.targetSha !== undefined) {
    // A repair that proved itself green before committing is not put through the same suite again
    if (!repair.isVerified && !checkIsGreen(cwd)) {
      console.info(`the repair is red — counted on ${MAIN_BRANCH}'s head, tried again next run`);
      postCommitComment(
        mainSha,
        `${getMarker(REPAIR_FAILED_MARKER, mainSha, [collectorSha])}\nThe repair of this red ${MAIN_BRANCH} head failed the checks as a cut — see the collector run.`,
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
    // A red cut over a red `main` under repair is the red of neither claimed commit, and is not counted on them
    if (claimedShas.length > 0)
      console.info(`express: ${claimedShas.length} claimed commits wait on the red ${MAIN_BRANCH}`);
    return { heldShas: claimedShas };
  } else if (cut?.targetSha !== undefined) {
    console.info("the express cut is red — counted on its commits");
    countRedCut(cut.shas, shaAttemptsMap, basisShas);
  }
  // A claimed commit whose patch did not apply waits on the unported work it needs, and is not counted: the next
  // Window may carry that work
  return { heldShas: claimedShas };
};
