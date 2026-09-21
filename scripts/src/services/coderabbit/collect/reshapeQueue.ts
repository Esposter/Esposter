import type { ReshapeInput } from "#src/models/coderabbit/collect/ReshapeInput";

import { SessionRole } from "#src/models/coderabbit/collect/SessionRole";
import { abortSequencing } from "#src/services/coderabbit/collect/abortSequencing";
import {
  EXPRESS_TRAILER,
  RESHAPE_FAILED_MARKER,
  SESSION_ATTEMPT_CAP,
  SessionRoleModelMap,
} from "#src/services/coderabbit/collect/constants";
import { getAttemptFailure } from "#src/services/coderabbit/collect/getAttemptFailure";
import { getFileCount } from "#src/services/coderabbit/collect/getFileCount";
import { getMarkedCount } from "#src/services/coderabbit/collect/getMarkedCount";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getReshapeFailure } from "#src/services/coderabbit/collect/getReshapeFailure";
import { getReshapePrompt } from "#src/services/coderabbit/collect/getReshapePrompt";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { readCommitComments } from "#src/services/coderabbit/collect/readCommitComments";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { readTrailedShas } from "#src/services/coderabbit/collect/readTrailedShas";
import { runSession } from "#src/services/coderabbit/collect/runSession";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";

// The queue never holds on the cap: the first owed commit that alone changes more files than a window may carry
// Is repackaged here — by the drain's session, told what shape to leave and proved by the tree it left — into the
// Parts that need no review, trailered for the express lane, and the parts that do, each under the cap. One
// Commit per run: the rewrite's push fires the next. Whether HEAD was rewritten is the answer; a failed attempt
// Is counted on the commit and fails the run, and past the cap the commit is left as it is — the port holds on
// It, and the held notice says so (docs: infra/review-collector/collection-cycle, "Sync").
export const reshapeQueue = async ({ cwd, isDryRun, targetSha, viewerLogin }: ReshapeInput): Promise<boolean> => {
  const owedShas = getNonEmptyLines(runGit(["rev-list", "--reverse", `${targetSha}..HEAD`], cwd));
  // A commit claiming no review is the express lane's at any size, so the cap is not its measure: reshaping one
  // Would pay a session per run to repackage what no window will ever carry
  const claimedShas = readTrailedShas(owedShas, EXPRESS_TRAILER, cwd);
  const sha = owedShas.find(
    (owedSha) => !claimedShas.has(owedSha) && getFileCount(`${owedSha}^..${owedSha}`, cwd) > REVIEW_FILE_CAP,
  );
  if (sha === undefined) return false;

  const fileCount = getFileCount(`${sha}^..${sha}`, cwd);
  if (isDryRun) {
    console.info(`would reshape ${sha} — ${fileCount} files alone against the cap of ${REVIEW_FILE_CAP}`);
    return false;
  }
  const marker = getMarker(RESHAPE_FAILED_MARKER, sha);
  const comments = readCommitComments(sha);
  const attempts = getMarkedCount(comments, viewerLogin, marker);
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
  const failure = isEnded ? getReshapeFailure(sha, cwd) : "exited non-zero";
  // The final tree equals the original's, so what followed the commit applies as it did — a stop here is a
  // Reshaping that lied about its tree in a way the diff did not show, and counts the same
  const isReplayed =
    failure === undefined &&
    (restShas.length === 0 ||
      getResult(() => runGit(["cherry-pick", "--empty=drop", ...restShas], cwd)).match(
        () => true,
        () => false,
      ));
  if (failure !== undefined || !isReplayed) {
    const reason = failure ?? `left a tree the commits after ${sha} no longer apply to`;
    // A session handed the repackaging can leave any operation open, not only the cherry-pick this step runs, and
    // A restore refuses over any of them. So what git holds is cleared by the command that owns it, and the
    // Attempt is counted before the tree is put back: the count is what hands the commit to a person, and a
    // Restore that threw would leave the reshaper spending a session on it every run forever.
    abortSequencing(cwd);
    postCommitComment(sha, getAttemptFailure({ attempts, detail: reason, marker, task: `reshape ${sha}` }));
    runGit(["switch", "--detach", tipSha], cwd);
    throw new InvalidOperationError(
      Operation.Update,
      "coderabbit",
      `the reshaper ${reason} (attempt ${attempts + 1} of ${SESSION_ATTEMPT_CAP} on ${sha})`,
    );
  }
  const partCount = getNonEmptyLines(runGit(["rev-list", `${sha}^..HEAD`], cwd)).length - restShas.length;
  console.info(`reshape: ${sha} became ${partCount} commits`);
  return true;
};
