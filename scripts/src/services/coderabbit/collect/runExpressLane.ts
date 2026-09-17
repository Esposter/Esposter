import type { ExpressLaneInput } from "#src/models/coderabbit/collect/ExpressLaneInput";
import type { ExpressLaneResult } from "#src/models/coderabbit/collect/ExpressLaneResult";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import {
  EXPRESS_FAILED_MARKER,
  EXPRESS_TRAILER,
  EXPRESS_VERIFY_COMMANDS,
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

// The checks a cut earns before it reaches `main` unread, run on the checkout as it stands
const checkIsGreen = (cwd: string): boolean =>
  EXPRESS_VERIFY_COMMANDS.every((args) => {
    console.info(`verify: pnpm ${args.join(" ")}`);
    return spawnPnpm(args, { cwd, stdio: "inherit" }).status === 0;
  });

// Build the cut, verify it, push it to `main`. `main` is production and the checks are the only gate a commit
// Claiming no review gets, so the cut earns every one CI would fail it on; a red one is told on its commits and
// Tried again next run. A push is the run's one irreversible act, so a lane that pushed ends the run. A red
// `main` goes first and alone: every cut is verified on its tree, so until it is repaired no claimed commit can
// Pass for a red none of them made, and the push of the repair fires the run that cuts them.
export const runExpressLane = async ({
  cwd,
  isDryRun,
  viewerLogin,
  ...expressInput
}: ExpressLaneInput): Promise<ExpressLaneResult> => {
  const { mainSha } = expressInput;
  const claimedShas = readClaimedShas({ cwd, ...expressInput });
  const repair = await repairMain({ cwd, isDryRun, mainSha, viewerLogin });
  if (repair.targetSha !== undefined) {
    if (!checkIsGreen(cwd)) {
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
  } else if (repair.isRed) {
    if (claimedShas.length > 0)
      console.info(`express: ${claimedShas.length} claimed commits wait on the red ${MAIN_BRANCH}`);
    return { heldShas: claimedShas };
  } else if (claimedShas.length === 0) return { heldShas: [] };

  console.info(`express: ${claimedShas.length} commits claim nothing in them to review`);
  const { shas, targetSha } = portExpress({ cwd, mainSha, shas: claimedShas });
  // A claimed commit whose patch did not apply waits on the unported work it needs, and is not told: the next
  // Window may carry that work
  if (targetSha === undefined) return { heldShas: claimedShas };
  // A dry run reports the cut and carries on rather than ending here: nothing it does is irreversible, so the one
  // Pass is worth every stage's decision — the cut, the reshaping, the window — instead of only the first
  if (isDryRun) {
    console.info(`express: would verify and push ${targetSha} to ${MAIN_BRANCH}`);
    return { heldShas: [] };
  } else if (!checkIsGreen(cwd)) {
    console.info("the express cut is red — told on its commits, tried again next run");
    postRedCut(shas, viewerLogin);
    return { heldShas: claimedShas };
  } else if (!pushBranch({ branch: MAIN_BRANCH, cwd, expectedSha: mainSha, isDryRun, sha: targetSha }))
    return { heldShas: claimedShas, outcome: getMovedOutcome(MAIN_BRANCH) };
  return {
    heldShas: [],
    outcome: {
      kind: CycleOutcomeKind.Expressed,
      reason: `${shas.length} express commits reached ${MAIN_BRANCH}`,
      targetSha,
    },
  };
};
