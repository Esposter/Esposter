import { REPLAY_WORKTREE_PREFIX } from "#src/services/queue/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult, noop } from "@esposter/shared";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Registers a throwaway detached worktree at `commit` in the checkout at `cwd`, and returns its directory. A worktree is
// A full checkout, so one is made only where a tree is built off to the side. The caller removes it on every path
export const addReplayWorktree = (commit: string, cwd: string): string => {
  const replayCwd = mkdtempSync(join(tmpdir(), REPLAY_WORKTREE_PREFIX));
  getResult(() => runGit(["worktree", "add", "--quiet", "--detach", replayCwd, commit], cwd)).match(noop, (error) => {
    rmSync(replayCwd, { force: true, recursive: true });
    throw error;
  });
  return replayCwd;
};
