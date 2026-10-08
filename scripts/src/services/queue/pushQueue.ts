import { QueuePushOutcome } from "#src/models/queue/QueuePushOutcome";
import { checkIsAncestor } from "#src/services/coderabbit/collect/checkIsAncestor";
import { QUEUE_BRANCH } from "#src/services/coderabbit/collect/constants";
import { carryCommit } from "#src/services/queue/carryCommit";
import { readQueueCommits } from "#src/services/queue/readQueueCommits";
import { selectReplayCommits } from "#src/services/queue/selectReplayCommits";
import { syncCheckout } from "#src/services/queue/syncCheckout";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const REMOTE_QUEUE_REF = `origin/${QUEUE_BRANCH}`;
const WORKTREE_PREFIX = "queue-push-";

// `--fork-point` reads the remote's reflog, so it names where the branch last met the remote even after a rewrite.
// Without that reflog entry the plain merge base is the fork point
const readForkPoint = (head: string, cwd: string): string =>
  getResult(() => runGit(["merge-base", "--fork-point", REMOTE_QUEUE_REF, head], cwd).trim()).match(
    (forkPoint) => forkPoint,
    () => runGit(["merge-base", REMOTE_QUEUE_REF, head], cwd).trim(),
  );

// The session's push of `ai/queue`, which never waits on a tree it does not own. A fast-forward pushes at once. Once
// The collector has rewritten the remote, the session's commits since the fork point are replayed onto it, skipping
// Those the collector already ported, in a throwaway detached worktree: the checkout's tree may hold another session's
// Edit, and a rebase or a push reads nothing but git. The push leaves from the checkout, naming the replayed commit,
// Since the two share one object store. Only a conflict waits, and nothing moves. Once the push lands the checkout's
// Branch is synced onto the commit it carried (`syncCheckout`), so the local branch never drifts behind the remote
export const pushQueue = (cwd: string = REPOSITORY_ROOT): QueuePushOutcome => {
  runGit(["fetch", "--quiet", "origin", QUEUE_BRANCH], cwd);
  const head = runGit(["rev-parse", "HEAD"], cwd).trim();
  if (checkIsAncestor(REMOTE_QUEUE_REF, head, cwd)) {
    runGit(["push", "--quiet", "origin", `${head}:refs/heads/${QUEUE_BRANCH}`], cwd);
    syncCheckout(head, head, cwd);
    return QueuePushOutcome.Pushed;
  }

  const forkPoint = readForkPoint(head, cwd);
  const localCommits = readQueueCommits(`${forkPoint}..${head}`, cwd);
  const remoteCommits = readQueueCommits(`${forkPoint}..${REMOTE_QUEUE_REF}`, cwd);
  const replayCommits = selectReplayCommits(localCommits, remoteCommits);
  // A worktree is a full checkout, which is why the fast-forward above needs none. It is registered in the checkout
  // Apart from its directory, so it is removed on every path, a refused push included, or one is left per retry
  const replayCwd = mkdtempSync(join(tmpdir(), WORKTREE_PREFIX));
  runGit(["worktree", "add", "--quiet", "--detach", replayCwd, REMOTE_QUEUE_REF], cwd);
  const result = getResult(() => {
    if (!replayCommits.every((commit) => carryCommit(commit.sha, replayCwd))) return QueuePushOutcome.Waiting;

    const replayed = runGit(["rev-parse", "HEAD"], replayCwd).trim();
    runGit(["push", "--quiet", "origin", `${replayed}:refs/heads/${QUEUE_BRANCH}`], cwd);
    syncCheckout(replayed, head, cwd);
    return QueuePushOutcome.Pushed;
  });
  runGit(["worktree", "remove", "--force", replayCwd], cwd);
  return result.match(
    (outcome) => outcome,
    (error) => {
      throw error;
    },
  );
};
