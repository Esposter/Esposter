import { QueuePushOutcome } from "#src/models/queue/QueuePushOutcome";
import { checkIsAncestor } from "#src/services/coderabbit/collect/checkIsAncestor";
import { QUEUE_BRANCH } from "#src/services/coderabbit/collect/constants";
import { carryReplayCommit } from "#src/services/queue/carryReplayCommit";
import { checkIsRetried } from "#src/services/queue/checkIsRetried";
import { checkIsStaleRefusal } from "#src/services/queue/checkIsStaleRefusal";
import { MAX_PUSH_ATTEMPTS } from "#src/services/queue/constants";
import { readQueueCommits } from "#src/services/queue/readQueueCommits";
import { selectReplayCommits } from "#src/services/queue/selectReplayCommits";
import { syncCheckout } from "#src/services/queue/syncCheckout";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult, getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";
import { mkdtempSync, rmSync } from "node:fs";
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

// Pushes `sha` onto the remote's queue branch. Only the refusal as stale is returned as false: the remote moved since
// The fetch, and nothing landed. Any other failure, such as an unreachable remote, is thrown as it always was
const pushQueueHead = (sha: string, cwd: string): boolean =>
  getResult(() => runGit(["push", "--quiet", "origin", `${sha}:refs/heads/${QUEUE_BRANCH}`], cwd)).match(
    () => true,
    (error) => {
      if (!checkIsStaleRefusal(error.message)) throw error;
      return false;
    },
  );

// One fetch, replay and push of the session's commits, as `pushQueue` describes. A push refused as stale is reported as
// `Refused`, so the caller can make it again on the remote as it now stands
const attemptPush = async (cwd: string): Promise<QueuePushOutcome> => {
  runGit(["fetch", "--quiet", "origin", QUEUE_BRANCH], cwd);
  const head = runGit(["rev-parse", "HEAD"], cwd).trim();
  if (checkIsAncestor(REMOTE_QUEUE_REF, head, cwd)) {
    if (!pushQueueHead(head, cwd)) return QueuePushOutcome.Refused;
    syncCheckout(head, head, cwd);
    return QueuePushOutcome.Pushed;
  }

  const forkPoint = readForkPoint(head, cwd);
  const localCommits = readQueueCommits(`${forkPoint}..${head}`, cwd);
  const remoteCommits = readQueueCommits(`${forkPoint}..${REMOTE_QUEUE_REF}`, cwd);
  const replayCommits = selectReplayCommits(localCommits, remoteCommits);
  // A worktree is a full checkout, which is why the fast-forward above needs none. It is registered in the checkout
  // Apart from its directory, so it is removed on every path, a refused push included, or one is left per attempt
  const replayCwd = mkdtempSync(join(tmpdir(), WORKTREE_PREFIX));
  getResult(() => runGit(["worktree", "add", "--quiet", "--detach", replayCwd, REMOTE_QUEUE_REF], cwd)).match(
    noop,
    (error) => {
      rmSync(replayCwd, { force: true, recursive: true });
      throw error;
    },
  );
  const result = await getResultAsync(async () => {
    for (const commit of replayCommits)
      // oxlint-disable-next-line no-await-in-loop -- each commit is picked onto the tree the one before it left
      if (!(await carryReplayCommit(commit.sha, replayCwd))) return QueuePushOutcome.Waiting;

    const replayed = runGit(["rev-parse", "HEAD"], replayCwd).trim();
    if (!pushQueueHead(replayed, cwd)) return QueuePushOutcome.Refused;
    syncCheckout(replayed, head, cwd);
    return QueuePushOutcome.Pushed;
  });
  const removal = getResult(() => runGit(["worktree", "remove", "--force", replayCwd], cwd));
  return result.match(
    (outcome) =>
      removal.match(
        () => outcome,
        (error) => {
          throw error;
        },
      ),
    // A replay that failed is the error thrown, and a removal that failed beside it is logged rather than masking it
    (error) => {
      removal.match(noop, console.error);
      throw error;
    },
  );
};

// The session's push of `ai/queue`, which never waits on a tree it does not own. A fast-forward pushes at once. Once
// The collector has rewritten the remote, the session's commits since the fork point are replayed onto it, skipping
// Those the collector already ported, in a throwaway detached worktree: the checkout's tree may hold another session's
// Edit, and a rebase or a push reads nothing but git. A replay that stops on a conflict is settled in that worktree
// First (`carryReplayCommit`: the lockfile rebuilt, else one headless session); only a stop neither settles waits, and
// Nothing moves. The push leaves from the checkout, naming the replayed commit, since the two share one object store.
// Once the push lands the checkout's branch is synced onto the commit it carried (`syncCheckout`), so the local branch
// Never drifts behind the remote. A push the remote refused as stale (the collector wrote it since the fetch) is made
// Again from a fresh fetch, up to `MAX_PUSH_ATTEMPTS`, and only then does the push fail
export const pushQueue = async (cwd: string = REPOSITORY_ROOT): Promise<QueuePushOutcome> => {
  let outcome = await attemptPush(cwd);
  for (let attempts = 1; checkIsRetried(outcome, attempts); attempts++)
    // oxlint-disable-next-line no-await-in-loop -- each attempt fetches the remote the one before it was refused by
    outcome = await attemptPush(cwd);

  if (outcome === QueuePushOutcome.Refused)
    throw new InvalidOperationError(
      Operation.Push,
      QUEUE_BRANCH,
      `the remote moved in each of ${MAX_PUSH_ATTEMPTS} pushes, so none landed`,
    );
  return outcome;
};
