import type { ReshapeInput } from "#src/models/coderabbit/collect/ReshapeInput";

import { AttemptFailedError } from "#src/models/coderabbit/collect/AttemptFailedError";
import { SessionRole } from "#src/models/coderabbit/collect/SessionRole";
import { abortSequencing } from "#src/services/coderabbit/collect/abortSequencing";
import { checkIsPicked } from "#src/services/coderabbit/collect/checkIsPicked";
import {
  EXPRESS_TRAILER,
  RESHAPE_FAILED_MARKER,
  SESSION_ATTEMPT_CAP,
  SessionRoleModelMap,
} from "#src/services/coderabbit/collect/constants";
import { getReshapePrompt } from "#src/services/coderabbit/collect/getReshapePrompt";
import { parkCommits } from "#src/services/coderabbit/collect/parkCommits";
import { readCommitAttempts } from "#src/services/coderabbit/collect/readCommitAttempts";
import { readExcludedGlobs } from "#src/services/coderabbit/collect/readExcludedGlobs";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { readHeldShas } from "#src/services/coderabbit/collect/readHeldShas";
import { readReshapeFailure } from "#src/services/coderabbit/collect/readReshapeFailure";
import { readReviewedFilePaths } from "#src/services/coderabbit/collect/readReviewedFilePaths";
import { readTrailedShas } from "#src/services/coderabbit/collect/readTrailedShas";
import { readWindowFilePaths } from "#src/services/coderabbit/collect/readWindowFilePaths";
import { runSession } from "#src/services/coderabbit/collect/runSession";
import { skipStops } from "#src/services/coderabbit/collect/skipStops";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// The queue never holds on the cap: the first owed commit that adds more files than a window has room for
// Is repackaged here — by the drain's session, told what shape to leave and proved by the tree it left — into the
// Parts that need no review, trailered for the express lane, and the parts that do, each within the room. One
// Commit per run: the rewrite's push fires the next. Whether HEAD was rewritten is the answer; a failed attempt
// Is counted on the commit and ends the run, and past the cap the commit is parked on its held branch and the rest
// Replayed without it (docs: infra/review-collector/collection-cycle, "Sync"). Every count is the review's own,
// Through the base's path filters, so a commit too big only unfiltered never costs a session.
export const reshapeQueue = async ({
  baseSha,
  collectorSha,
  cwd,
  fileCap,
  isDryRun,
  targetSha,
  viewerLogin,
}: ReshapeInput): Promise<boolean> => {
  // A queue already on its target was not replayed, so a commit the opener parked can still sit in it — owed nowhere,
  // So never reshaped, and dropped by any rewrite that replays past it
  const heldShas = readHeldShas(cwd);
  const owedShas = getNonEmptyLines(runGit(["rev-list", "--reverse", `${targetSha}..HEAD`], cwd)).filter(
    (owedSha) => !heldShas.has(owedSha),
  );
  // A commit claiming no review is the express lane's at any size, so the room is not its measure: reshaping one
  // Would pay a session per run to repackage what no window will ever carry
  const claimedShas = readTrailedShas(owedShas, EXPRESS_TRAILER, cwd);
  // The room is what the cap leaves beside the fixes and pending commits every window carries ahead of the queue:
  // A commit that fits the cap alone but not beside them is held behind every window a review's findings lead, and
  // The queue ships nothing but fixes. Fixes that fill the cap alone are the port's failure, not a shape to ask for
  const windowPaths = new Set(readWindowFilePaths(baseSha, cwd, targetSha));
  const roomFileCount = fileCap - windowPaths.size;
  if (roomFileCount <= 0) return false;
  const readCommitFilePaths = (sha: string): string[] => readReviewedFilePaths(baseSha, `${sha}^..${sha}`, cwd);
  // A file the window already counts costs a commit nothing, so only the files it adds are measured against the
  // Room: the port counts the resulting window's distinct files, and would take a commit this would reshape
  const sha = owedShas.find(
    (owedSha) =>
      !claimedShas.has(owedSha) &&
      readCommitFilePaths(owedSha).filter((path) => !windowPaths.has(path)).length > roomFileCount,
  );
  if (sha === undefined) return false;

  const fileCount = readCommitFilePaths(sha).length;
  const { attempts, recordFailure } = readCommitAttempts({
    collectorSha,
    marker: RESHAPE_FAILED_MARKER,
    sha,
    viewerLogin,
  });
  if (isDryRun) {
    console.info(
      `would ${attempts >= SESSION_ATTEMPT_CAP ? "park" : "reshape"} ${sha} — ${fileCount} files alone against a room of ${roomFileCount}`,
    );
    return false;
  }
  const restShas = owedShas.slice(owedShas.indexOf(sha) + 1);
  if (attempts >= SESSION_ATTEMPT_CAP) {
    console.info(`reshape: ${sha} failed ${attempts} times — parked, and what followed it replayed without it`);
    // A later commit that no longer applies without the parked one goes with it, in the same issue; nothing is
    // Pushed until this returns, so a commit skipped here is on its held branch before the queue drops it
    const parkedShas = [sha];
    runGit(["switch", "--detach", `${sha}^`], cwd);
    if (!checkIsPicked(restShas, cwd))
      skipStops(cwd, restShas.length, (stoppedSha) => {
        parkedShas.push(stoppedSha);
        return true;
      });
    parkCommits({
      cause: `its reshaping under the window's room failed ${attempts} times`,
      cwd,
      isDryRun,
      shas: parkedShas,
      viewerLogin,
    });
    return true;
  }

  const tipSha = readHeadSha(cwd);
  console.info(`reshape: ${sha} changes ${fileCount} files alone against a room of ${roomFileCount}`);
  runGit(["switch", "--detach", `${sha}^`], cwd);
  const prompt = getReshapePrompt({
    excludedGlobs: readExcludedGlobs(baseSha, cwd),
    fileCap,
    fileCount,
    roomFileCount,
    sha,
  });
  const { isEnded } = await runSession({ cwd, model: SessionRoleModelMap[SessionRole.Reshape], prompt });
  const failure = isEnded ? readReshapeFailure(sha, roomFileCount, baseSha, cwd) : "exited non-zero";
  // The final tree equals the original's, so what followed the commit applies as it did — a stop here is a
  // Reshaping that lied about its tree in a way the diff did not show, and counts the same. What followed may
  // Hold an empty copy a resolution left this run, which the same sequence rides through
  const isReplayed = failure === undefined && checkIsPicked(restShas, cwd);
  if (failure !== undefined || !isReplayed) {
    const reason = failure ?? `left a tree the commits after ${sha} no longer apply to`;
    // A session handed the repackaging can leave any operation open, not only the cherry-pick this step runs, and
    // A restore refuses over any of them. So what git holds is cleared by the command that owns it, and the
    // Attempt is counted before the tree is put back: the count is what parks the commit, and a restore that threw
    // Would leave the reshaper spending a session on it every run forever.
    abortSequencing(cwd);
    recordFailure(`reshape ${sha}`, reason);
    runGit(["switch", "--detach", tipSha], cwd);
    throw new AttemptFailedError(
      `the reshaper ${reason} (attempt ${attempts + 1} of ${SESSION_ATTEMPT_CAP} on ${sha})`,
    );
  }
  const partCount = getNonEmptyLines(runGit(["rev-list", `${sha}^..HEAD`], cwd)).length - restShas.length;
  console.info(`reshape: ${sha} became ${partCount} commits`);
  return true;
};
