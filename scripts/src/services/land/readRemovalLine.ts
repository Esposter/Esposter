// The line a landing ends on for its worktree.
// If the landing cannot remove it, the worktree stays, and the line names the command that removes it from outside.
// The shell and pnpm that launched the landing hold the worktree as their working directory until it exits.
// So the removal is run once they have gone
export const readRemovalLine = (worktreePath: string, isRemoved: boolean): string =>
  isRemoved
    ? `removed ${worktreePath}`
    : `landed, worktree not removed: ${worktreePath}, run pnpm ai:worktree:remove ${worktreePath}`;
