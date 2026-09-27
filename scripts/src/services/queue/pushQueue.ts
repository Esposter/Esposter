import { QueuePushOutcome } from "#src/models/queue/QueuePushOutcome";
import { checkIsAncestor } from "#src/services/coderabbit/collect/checkIsAncestor";
import { QUEUE_BRANCH } from "#src/services/coderabbit/collect/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const REMOTE_QUEUE_REF = `origin/${QUEUE_BRANCH}`;
const WORKTREE_PREFIX = "queue-push-";
// The session's push of `ai/queue`, which never waits on a tree it does not own. With nothing to replay it pushes at
// Once; otherwise it replays onto the remote from the fork point, as `git pull --rebase` does, so a commit the
// Collector already rewrote is never replayed. Over a clean tree the replay moves the branch itself; over another
// Session's work mid-edit it runs in a throwaway detached worktree, since a rebase and a push read nothing but git and
// The worktree needs no install. The push always leaves from the checkout itself, naming the replayed commit, since
// The two share one object store and a remote named by a relative path resolves only from there. Only a conflict
// Waits: settling one is a session's, over a clean tree
export const pushQueue = (cwd: string = REPOSITORY_ROOT): QueuePushOutcome => {
  runGit(["fetch", "--quiet", "origin", QUEUE_BRANCH], cwd);
  if (checkIsAncestor(REMOTE_QUEUE_REF, "HEAD", cwd)) {
    runGit(["push", "--quiet", "origin", `HEAD:${QUEUE_BRANCH}`], cwd);
    return QueuePushOutcome.Pushed;
  }

  const isClean = runGit(["status", "--porcelain"], cwd) === "";
  const replayCwd = isClean ? cwd : mkdtempSync(join(tmpdir(), WORKTREE_PREFIX));
  if (!isClean) runGit(["worktree", "add", "--quiet", "--detach", replayCwd, "HEAD"], cwd);
  // A refused push still removes the worktree, then fails the run: the worktree is registered in the checkout apart
  // From its directory, so one left behind per retry is never collected
  const result = getResult(() =>
    getResult(() => runGit(["rebase", "--quiet", "--fork-point", REMOTE_QUEUE_REF], replayCwd)).match(
      () => {
        const replayed = runGit(["rev-parse", "HEAD"], replayCwd).trim();
        runGit(["push", "--quiet", "origin", `${replayed}:refs/heads/${QUEUE_BRANCH}`], cwd);
        return QueuePushOutcome.Pushed;
      },
      () => {
        runGit(["rebase", "--abort"], replayCwd);
        return QueuePushOutcome.Waiting;
      },
    ),
  );
  if (!isClean) runGit(["worktree", "remove", "--force", replayCwd], cwd);
  return result.match(
    (outcome) => outcome,
    (error) => {
      throw error;
    },
  );
};
