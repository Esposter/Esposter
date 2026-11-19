import { TASK_CACHE_DATABASE_NAME, TASK_CACHE_PATH } from "#src/services/worktree/create/constants";
import { AGENT_WORKTREES_DIRECTORY } from "@esposter/configuration";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

// The sibling worktrees under the main checkout's worktrees folder whose task cache holds a database, which is every one a
// Run has recorded into
export const listSiblingCachePaths = (mainCheckoutRoot: string, worktreePath: string): string[] => {
  const worktreesDirectory = join(mainCheckoutRoot, AGENT_WORKTREES_DIRECTORY);
  if (!existsSync(worktreesDirectory)) return [];
  return readdirSync(worktreesDirectory)
    .map((name) => join(worktreesDirectory, name))
    .filter((path) => path !== worktreePath && existsSync(join(path, TASK_CACHE_PATH, TASK_CACHE_DATABASE_NAME)));
};
