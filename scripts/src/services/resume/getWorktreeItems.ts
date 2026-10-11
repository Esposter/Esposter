import type { ResumeItem } from "#src/models/resume/ResumeItem";

import { REMOVE_WORKTREE_SCRIPT } from "#src/services/resume/constants";

const WORKTREE_PREFIX = "worktree ";
const HEAD_PREFIX = "HEAD ";
const HEAD_LENGTH = 10;

// The linked worktrees of `git worktree list --porcelain`: its first block is the main checkout, which is not a leftover
export const getWorktreeItems = (porcelain: string): ResumeItem[] =>
  porcelain
    .split("\n\n")
    .slice(1)
    .flatMap((block) => {
      const lines = block.split("\n");
      const path = lines.find((line) => line.startsWith(WORKTREE_PREFIX))?.slice(WORKTREE_PREFIX.length);
      if (path === undefined) return [];
      const head =
        lines
          .find((line) => line.startsWith(HEAD_PREFIX))
          ?.slice(HEAD_PREFIX.length)
          .slice(0, HEAD_LENGTH) ?? "";
      return [{ action: `${REMOVE_WORKTREE_SCRIPT} ${path} once nothing uses it`, text: `${path} ${head}` }];
    });
