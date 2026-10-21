import { AGENT_WORKTREES_DIRECTORY } from "@esposter/configuration";

// A folder under the worktrees folder that git no longer lists, given as a resolved path. Only that folder holds the
// Worktrees a removal may delete without git's say, so a path anywhere else is refused as not a worktree
export const checkIsOrphanPath = (resolvedPath: string): boolean =>
  resolvedPath.replaceAll("\\", "/").includes(`/${AGENT_WORKTREES_DIRECTORY}/`);
