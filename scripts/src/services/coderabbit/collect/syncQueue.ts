import type { SyncQueueInput } from "#src/models/coderabbit/collect/SyncQueueInput";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { checkIsAncestor } from "#src/services/coderabbit/collect/checkIsAncestor";
import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import {
  DEVELOP_BRANCH,
  DRAIN_ATTEMPT_CAP,
  QUEUE_BRANCH,
  REVIEW_FIXES_BRANCH,
  SYNC_FAILED_MARKER,
} from "#src/services/coderabbit/collect/constants";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getSyncPrompt } from "#src/services/coderabbit/collect/getSyncPrompt";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { readDirtyPaths } from "#src/services/coderabbit/collect/readDirtyPaths";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { readSha } from "#src/services/coderabbit/collect/readSha";
import { readUnmergedPaths } from "#src/services/coderabbit/collect/readUnmergedPaths";
import { runDrain } from "#src/services/coderabbit/collect/runDrain";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

// Whether the sequencer still holds a cherry-pick open — stopped on a conflict, or left by a session that never
// Ran it to the end
const checkIsPicking = (cwd: string): boolean =>
  readSha("CHERRY_PICK_HEAD", cwd) !== undefined ||
  existsSync(resolve(cwd, runGit(["rev-parse", "--git-path", "sequencer"], cwd).trim()));

// The queue follows what the collector pushed, rewritten by the collector itself: the commits it still owes are
// Replayed in order onto the tree the next window is built on — the fixes branch while it owes develop commits,
// Develop otherwise — and pushed back under a lease on the sha that was read. A queue left on an old base
// Carries commits written against files a drain has since repaired, and every one is a conflict the porter would
// Hold on; here it is met once, by the drain's own session, and the working session's `git pull --rebase`
// Afterwards replays only what it committed since (`review-queue` skill). Returns the sha the port reads: the
// Rewritten head, or the one read when nothing was rewritten.
export const syncQueue = async ({
  cwd,
  developSha,
  isDryRun,
  queueSha,
  reviewFixesSha,
  viewerLogin,
}: SyncQueueInput): Promise<string> => {
  const owingFixesSha =
    reviewFixesSha !== undefined && readCherryShas(developSha, reviewFixesSha, cwd).length > 0
      ? reviewFixesSha
      : undefined;
  const targetSha = owingFixesSha ?? developSha;
  if (checkIsAncestor(targetSha, queueSha, cwd)) return queueSha;

  const targetBranch = owingFixesSha === undefined ? DEVELOP_BRANCH : REVIEW_FIXES_BRANCH;
  const owedShas = readCherryShas(targetSha, queueSha, cwd);
  console.info(`sync: ${QUEUE_BRANCH} sits behind ${targetBranch} — replaying the ${owedShas.length} commits it owes`);
  runGit(["switch", "--detach", targetSha], cwd);
  // One sequence rather than a pick per commit: a stop is resumed by `--continue`, and a copy the tree already
  // Holds drops on its own
  const isReplayed =
    owedShas.length === 0 ||
    getResult(() => runGit(["cherry-pick", "--empty=drop", ...owedShas], cwd)).match(
      () => true,
      () => false,
    );
  if (!isReplayed) {
    const conflictSha = readSha("CHERRY_PICK_HEAD", cwd) ?? "";
    const conflictedPaths = readUnmergedPaths(cwd);
    const abort = (reason: string): string => {
      runGit(["cherry-pick", "--abort"], cwd);
      console.info(`sync: ${conflictSha} conflicts with ${targetBranch} — ${reason}`);
      return queueSha;
    };
    if (isDryRun) return abort("a dry run resolves nothing");
    // The attempts are counted on the commit itself: the queue is synced with no pull request open as often as
    // With one, and a count kept on the pull request would leave the resolver uncapped in between
    const marker = getMarker(SYNC_FAILED_MARKER, conflictSha);
    const attempts = readEntries<GitHubEntry>(`commits/${conflictSha}/comments`).filter((comment) =>
      checkIsMarked(comment, viewerLogin, marker),
    ).length;
    if (attempts >= DRAIN_ATTEMPT_CAP) return abort(`its resolution failed ${attempts} times, so it is a person's`);

    const { isDrained, limitResetAtMs } = await runDrain(
      getSyncPrompt({ conflictedPaths, conflictSha, targetBranch }),
      cwd,
    );
    if (limitResetAtMs !== undefined) return abort("the resolver could not start, and no attempt is counted");
    // A clean exit says the session ended; what proves the resolution is a sequence run to its end over a clean
    // Tree. Anything else fails the run as a drain does, with the attempt counted on the commit
    else if (!isDrained || checkIsPicking(cwd) || readDirtyPaths(cwd).length > 0) {
      postCommitComment(
        conflictSha,
        `${marker}\nResolution attempt ${attempts + 1} of the conflict this commit brings to ${targetBranch} failed — see the collector run.`,
      );
      throw new InvalidOperationError(
        Operation.Update,
        "coderabbit",
        `the resolver left ${conflictSha} unresolved (attempt ${attempts + 1} of ${DRAIN_ATTEMPT_CAP})`,
      );
    }
  }

  const syncedSha = readHeadSha(cwd);
  if (!pushBranch({ branch: QUEUE_BRANCH, cwd, expectedSha: queueSha, isDryRun, isRewrite: true, sha: syncedSha })) {
    console.info(`sync: ${QUEUE_BRANCH} moved during the run — the next run replays onto what it now carries`);
    return queueSha;
  }
  return syncedSha;
};
