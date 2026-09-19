import type { MergeMainInput } from "#src/models/coderabbit/collect/MergeMainInput";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { MergeMainOutcome } from "#src/models/coderabbit/collect/MergeMainOutcome";
import { SessionRole } from "#src/models/coderabbit/collect/SessionRole";
import { abortSequencing } from "#src/services/coderabbit/collect/abortSequencing";
import { checkIsAncestor } from "#src/services/coderabbit/collect/checkIsAncestor";
import { checkIsLockfileOnly } from "#src/services/coderabbit/collect/checkIsLockfileOnly";
import { checkIsSequencing } from "#src/services/coderabbit/collect/checkIsSequencing";
import {
  FOLD_FAILED_MARKER,
  MAIN_BRANCH,
  SESSION_ATTEMPT_CAP,
  SessionRoleModelMap,
} from "#src/services/coderabbit/collect/constants";
import { getAttemptFailure } from "#src/services/coderabbit/collect/getAttemptFailure";
import { getFoldPrompt } from "#src/services/coderabbit/collect/getFoldPrompt";
import { getMarkedCount } from "#src/services/coderabbit/collect/getMarkedCount";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { readDirtyPaths } from "#src/services/coderabbit/collect/readDirtyPaths";
import { readUnmergedPaths } from "#src/services/coderabbit/collect/readUnmergedPaths";
import { rebuildLockfile } from "#src/services/coderabbit/collect/rebuildLockfile";
import { runSession } from "#src/services/coderabbit/collect/runSession";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";

// What landed on `main` unread — an express cut, a dependency bump — rides the window about to be pushed rather
// Than waiting for the release to bring the two together. The lockfile conflict that merge always brings is
// Rebuilt from the installed tree (`git` skill); any other conflict is the resolver's, counted on `main`'s head,
// And past its attempts the fold is abandoned — the release merge is then where a person meets it.
export const mergeMain = async ({ cwd, viewerLogin }: MergeMainInput): Promise<MergeMainOutcome> => {
  const main = `origin/${MAIN_BRANCH}`;
  if (checkIsAncestor(main, "HEAD", cwd)) return MergeMainOutcome.AlreadyMerged;

  const isMerged = getResult(() => runGit(["merge", "--no-edit", main], cwd)).match(
    () => true,
    () => false,
  );
  if (isMerged) return MergeMainOutcome.Merged;

  const conflictedPaths = readUnmergedPaths(cwd);
  if (checkIsLockfileOnly(conflictedPaths)) {
    rebuildLockfile(cwd);
    runGit(["commit", "--no-edit"], cwd);
    return MergeMainOutcome.Merged;
  }

  const mainSha = runGit(["rev-parse", main], cwd).trim();
  const abort = (reason: string): MergeMainOutcome => {
    runGit(["merge", "--abort"], cwd);
    console.info(`main not folded — ${reason}: ${conflictedPaths.join(", ")}`);
    return MergeMainOutcome.Conflicted;
  };
  const marker = getMarker(FOLD_FAILED_MARKER, mainSha);
  const comments = readEntries<GitHubEntry>(`commits/${mainSha}/comments`);
  const attempts = getMarkedCount(comments, viewerLogin, marker);
  if (attempts >= SESSION_ATTEMPT_CAP) return abort(`its conflicts failed the resolver ${attempts} times`);

  const prompt = getFoldPrompt({ conflictedPaths, mainSha });
  const { isEnded, isStarted } = await runSession({
    cwd,
    model: SessionRoleModelMap[SessionRole.Fold],
    prompt,
  });
  if (!isStarted) return abort("the resolver could not start, and no attempt is counted");
  // What proves the fold is the merge committed over a clean tree with `main` now an ancestor; the session's
  // Word proves nothing. Anything else counts the attempt on `main`'s head and fails the run.
  if (!isEnded || checkIsSequencing(cwd) || readDirtyPaths(cwd).length > 0 || !checkIsAncestor(main, "HEAD", cwd)) {
    // The merge the resolver left open is cleared before the attempt is written: the run fails either way, and a
    // Checkout over an unresolved index refuses — which would leave the runner the tree it resolves its own
    // Actions from half-merged (`reshapeQueue` clears its own for the same reason)
    abortSequencing(cwd);
    postCommitComment(
      mainSha,
      getAttemptFailure({ attempts, marker, task: `fold this ${MAIN_BRANCH} head into the window` }),
    );
    throw new InvalidOperationError(
      Operation.Update,
      "coderabbit",
      `the resolver left the fold of ${mainSha} unresolved (attempt ${attempts + 1} of ${SESSION_ATTEMPT_CAP})`,
    );
  }
  return MergeMainOutcome.Merged;
};
