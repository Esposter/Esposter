import type { ResumeItem } from "#src/models/resume/ResumeItem";

import { REMOVE_WORKTREE_SCRIPT, WORKTREES_DIRECTORY } from "#src/services/resume/constants";

const WORKTREE_PREFIX = "worktree ";
const HEAD_PREFIX = "HEAD ";
const HEAD_LENGTH = 10;

// The linked worktrees of `git worktree list --porcelain`, and every folder in the main checkout's worktrees folder that
// None of them is: a removal that stopped part way leaves one git no longer lists. Its first block is the main checkout,
// Which is not a leftover
export const getWorktreeItems = (porcelain: string, readFolderNames: (directory: string) => string[]): ResumeItem[] => {
  const worktrees = porcelain.split("\n\n").flatMap((block) => {
    const lines = block.split("\n");
    const path = lines.find((line) => line.startsWith(WORKTREE_PREFIX))?.slice(WORKTREE_PREFIX.length);
    if (path === undefined) return [];
    const head =
      lines
        .find((line) => line.startsWith(HEAD_PREFIX))
        ?.slice(HEAD_PREFIX.length)
        .slice(0, HEAD_LENGTH) ?? "";
    return [{ head, path }];
  });
  const [mainWorktree, ...linkedWorktrees] = worktrees;
  if (!mainWorktree) return [];

  const linkedPaths = new Set(linkedWorktrees.map(({ path }) => path));
  const worktreesDirectory = `${mainWorktree.path}/${WORKTREES_DIRECTORY}`;
  const orphanPaths = readFolderNames(worktreesDirectory)
    .map((name) => `${worktreesDirectory}/${name}`)
    .filter((path) => !linkedPaths.has(path));
  return [
    ...linkedWorktrees.map(({ head, path }) => ({
      action: `${REMOVE_WORKTREE_SCRIPT} ${path} once nothing uses it`,
      text: `${path} ${head}`,
    })),
    ...orphanPaths.map((path) => ({
      action: `${REMOVE_WORKTREE_SCRIPT} ${path} once nothing in it is wanted`,
      text: `${path} no worktree registers it`,
    })),
  ];
};
