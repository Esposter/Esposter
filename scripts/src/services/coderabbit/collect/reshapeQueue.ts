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
import { readCommitAttempts } from "#src/services/coderabbit/collect/readCommitAttempts";
import { readFileCount } from "#src/services/coderabbit/collect/readFileCount";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { readReshapeFailure } from "#src/services/coderabbit/collect/readReshapeFailure";
import { readTrailedShas } from "#src/services/coderabbit/collect/readTrailedShas";
import { runSession } from "#src/services/coderabbit/collect/runSession";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// The queue never holds on the cap: the first owed commit that alone changes more files than a window may carry
// Is repackaged here — by the drain's session, told what shape to leave and proved by the tree it left — into the
// Parts that need no review, trailered for the express lane, and the parts that do, each under the cap. One
// Commit per run: the rewrite's push fires the next. Whether HEAD was rewritten is the answer; a failed attempt
// Is counted on the commit and ends the run, and past the cap the commit is left as it is — the port holds on
// It, and the held notice says so (docs: infra/review-collector/collection-cycle, "Sync").
export const reshapeQueue = async ({
  collectorSha,
  cwd,
  isDryRun,
  targetSha,
  viewerLogin,
}: ReshapeInput): Promise<boolean> => {
  const owedShas = getNonEmptyLines(runGit(["rev-list", "--reverse", `${targetSha}..HEAD`], cwd));
  // A commit claiming no review is the express lane's at any size, so the cap is not its measure: reshaping one
  // Would pay a session per run to repackage what no window will ever carry
  const claimedShas = readTrailedShas(owedShas, EXPRESS_TRAILER, cwd);
  const sha = owedShas.find(
    (owedSha) => !claimedShas.has(owedSha) && readFileCount(`${owedSha}^..${owedSha}`, cwd) > REVIEW_FILE_CAP,
  );
  if (sha === undefined) return false;

  const fileCount = readFileCount(`${sha}^..${sha}`, cwd);
  if (isDryRun) {
    console.info(`would reshape ${sha} — ${fileCount} files alone against the cap of ${REVIEW_FILE_CAP}`);
    return false;
  }
  const { attempts, recordFailure } = readCommitAttempts({
    collectorSha,
    marker: RESHAPE_FAILED_MARKER,
    sha,
    viewerLogin,
  });
  if (attempts >= SESSION_ATTEMPT_CAP) {
    console.info(`reshape: ${sha} failed ${attempts} times, so it is a person's — the port holds on it`);
    return false;
  }

  const tipSha = readHeadSha(cwd);
  const restShas = owedShas.slice(owedShas.indexOf(sha) + 1);
  console.info(`reshape: ${sha} changes ${fileCount} files alone against the cap of ${REVIEW_FILE_CAP}`);
  runGit(["switch", "--detach", `${sha}^`], cwd);
  const prompt = getReshapePrompt({ fileCount, sha });
  const { isEnded, isStarted } = await runSession({
    cwd,
    model: SessionRoleModelMap[SessionRole.Reshape],
    prompt,
  });
  if (!isStarted) {
    runGit(["switch", "--detach", tipSha], cwd);
    console.info("reshape: the session could not start — no attempt is counted");
    return false;
  }
  const failure = isEnded ? readReshapeFailure(sha, cwd) : "exited non-zero";
  // The final tree equals the original's, so what followed the commit applies as it did — a stop here is a
  // Reshaping that lied about its tree in a way the diff did not show, and counts the same. What followed may
  // Hold an empty copy a resolution left this run, which the same sequence rides through
  const isReplayed = failure === undefined && checkIsPicked(restShas, cwd);
  if (failure !== undefined || !isReplayed) {
    const reason = failure ?? `left a tree the commits after ${sha} no longer apply to`;
    // A session handed the repackaging can leave any operation open, not only the cherry-pick this step runs, and
    // A restore refuses over any of them. So what git holds is cleared by the command that owns it, and the
    // Attempt is counted before the tree is put back: the count is what hands the commit to a person, and a
    // Restore that threw would leave the reshaper spending a session on it every run forever.
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
