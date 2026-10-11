import { QueuePushOutcome } from "#src/models/queue/QueuePushOutcome";
import { QUEUE_BRANCH } from "#src/services/coderabbit/collect/constants";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { addReplayWorktree } from "#src/services/queue/addReplayWorktree";
import { carryReplayCommit } from "#src/services/queue/carryReplayCommit";
import { checkIsRetried } from "#src/services/queue/checkIsRetried";
import { checkIsStaleRefusal } from "#src/services/queue/checkIsStaleRefusal";
import { MAX_PUSH_ATTEMPTS, REMOTE_QUEUE_REF } from "#src/services/queue/constants";
import { getRetryDelayMilliseconds } from "#src/services/queue/getRetryDelayMilliseconds";
import { readQueueCommits } from "#src/services/queue/readQueueCommits";
import { removeReplayWorktree } from "#src/services/queue/removeReplayWorktree";
import { selectReplayCommits } from "#src/services/queue/selectReplayCommits";
import { syncCheckout } from "#src/services/queue/syncCheckout";
import { writeLastPush } from "#src/services/queue/writeLastPush";
import { checkIsAncestor } from "#src/services/shared/checkIsAncestor";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult, getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";
import { setTimeout as sleep } from "node:timers/promises";

// `--fork-point` reads the remote's reflog, so it names where the branch last met the remote even after a rewrite.
// Without that reflog entry the plain merge base is the fork point
const readForkPoint = (head: string, cwd: string): string =>
  getResult(() => runGit(["merge-base", "--fork-point", REMOTE_QUEUE_REF, head], cwd).trim()).match(
    (forkPoint) => forkPoint,
    () => runGit(["merge-base", REMOTE_QUEUE_REF, head], cwd).trim(),
  );

// Pushes `sha`, which carries `count` commits, onto the remote's queue branch. Only the refusal as stale is returned as
// False: the remote moved since the fetch, and nothing landed. Any other failure, such as an unreachable remote, is thrown
// As it always was. A push that landed is recorded for the heartbeat, and a record that fails to write is only reported,
// Since the push has already landed
const pushQueueHead = (sha: string, count: number, cwd: string): boolean =>
  getResult(() => runGit(["push", "--quiet", "origin", `${sha}:refs/heads/${QUEUE_BRANCH}`], cwd)).match(
    () => {
      if (count > 0)
        getResult(() => writeLastPush(sha, count)).match(noop, (error) =>
          console.warn(`the push landed but was not recorded: ${error.message}`),
        );
      return true;
    },
    (error) => {
      if (!checkIsStaleRefusal(error.message)) throw error;
      return false;
    },
  );

// One fetch, replay and push of the session's commits, as `pushQueue` describes. A push refused as stale is reported as
// `Refused`, so the caller can make it again on the remote as it now stands
const attemptPush = async (cwd: string): Promise<QueuePushOutcome> => {
  runGit(["fetch", "--quiet", "origin", QUEUE_BRANCH], cwd);
  const head = readHeadSha(cwd);
  if (checkIsAncestor(REMOTE_QUEUE_REF, head, cwd)) {
    const carriedCount = readQueueCommits(`${REMOTE_QUEUE_REF}..${head}`, cwd).length;
    if (!pushQueueHead(head, carriedCount, cwd)) return QueuePushOutcome.Refused;
    syncCheckout(head, head, readHeadSha(cwd), cwd);
    return QueuePushOutcome.Pushed;
  }

  const forkPoint = readForkPoint(head, cwd);
  const localCommits = readQueueCommits(`${forkPoint}..${head}`, cwd);
  const remoteCommits = readQueueCommits(`${forkPoint}..${REMOTE_QUEUE_REF}`, cwd);
  const replayCommits = selectReplayCommits(localCommits, remoteCommits);
  // A worktree is a full checkout, which is why the fast-forward above needs none. It is registered in the checkout
  // Apart from its directory, so it is removed on every path, a refused push included, or one is left per attempt
  const replayCwd = addReplayWorktree(REMOTE_QUEUE_REF, cwd);
  const result = await getResultAsync(async () => {
    for (const commit of replayCommits)
      // oxlint-disable-next-line no-await-in-loop -- each commit is picked onto the tree the one before it left
      if (!(await carryReplayCommit(commit.sha, replayCwd))) return QueuePushOutcome.Waiting;

    const replayed = readHeadSha(replayCwd);
    if (!pushQueueHead(replayed, replayCommits.length, cwd)) return QueuePushOutcome.Refused;
    syncCheckout(replayed, head, readHeadSha(cwd), cwd);
    return QueuePushOutcome.Pushed;
  });
  removeReplayWorktree(replayCwd, cwd);
  return result.match(
    (outcome) => outcome,
    (error) => {
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
  for (let attempts = 1; checkIsRetried(outcome, attempts); attempts++) {
    // oxlint-disable-next-line no-await-in-loop -- each retry waits, then fetches the remote the attempt before it was refused by
    await sleep(getRetryDelayMilliseconds(attempts));
    // oxlint-disable-next-line no-await-in-loop -- as above
    outcome = await attemptPush(cwd);
  }

  if (outcome === QueuePushOutcome.Refused)
    throw new InvalidOperationError(
      Operation.Push,
      QUEUE_BRANCH,
      `the remote moved in each of ${MAX_PUSH_ATTEMPTS} pushes, so none landed`,
    );
  return outcome;
};
