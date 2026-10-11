import { runGit } from "#src/services/shared/runGit";
import { getResult, noop } from "@esposter/shared";
import { rmSync } from "node:fs";

// Removes the replay worktree. The directory is removed by node, which unlinks an install's junction without following
// It, where `git worktree remove` on Windows either fails on one ("Invalid argument") or deletes through it into the
// Shared install; the registration is then pruned. Its removal never decides the push: throwing there lost a push that
// Had replayed cleanly, so a failure of either step is only reported
export const removeReplayWorktree = (replayCwd: string, cwd: string): void => {
  getResult(() => rmSync(replayCwd, { force: true, maxRetries: 3, recursive: true })).match(noop, (error) =>
    console.warn(`The replay worktree ${replayCwd} is left behind: ${error.message}`),
  );
  getResult(() => runGit(["worktree", "prune"], cwd)).match(noop, (error) =>
    console.warn(`The replay worktree ${replayCwd} is left registered: ${error.message}`),
  );
};
