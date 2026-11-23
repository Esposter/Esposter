import { readWorkspacePackages } from "#src/services/shared/readWorkspacePackages";
import { generateBarrels } from "@esposter/configuration/generate-barrels";
import { join } from "node:path";

// Every workspace package's barrels, written from its own source and manifest before the install and the builds, so a
// Fresh worktree's `source` arms resolve as a built checkout's do. A build writes its barrel again with the folders its
// Own hook adds, which this does not read: genshin-world's lazy directories. The create builds genshin-world too, since
// The scripts package depends on it, so its barrel ends as that build writes it
export const writeWorktreeBarrels = (worktreePath: string): void => {
  for (const { directory, workspaceDirectory } of readWorkspacePackages(worktreePath))
    generateBarrels(join(worktreePath, workspaceDirectory, directory));
};
