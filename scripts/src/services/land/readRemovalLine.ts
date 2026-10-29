// The line a landing ends on for its worktree. A removal the landing cannot make leaves the worktree in place, and the line
// names the command that removes it from outside: the shell and pnpm that launched the landing hold the worktree as their
// working directory until it exits, so the removal is run once they have gone
export const readRemovalLine = (worktreePath: string, isRemoved: boolean): string =>
  isRemoved
    ? `removed ${worktreePath}`
    : `landed, worktree not removed: ${worktreePath}, run pnpm ai:worktree:remove ${worktreePath}`;
