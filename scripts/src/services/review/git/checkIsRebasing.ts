import { runGit } from "#src/services/shared/runGit";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

// Whether the checkout holds a rebase that stopped on a conflict: git keeps its state in `rebase-merge` until it ends
export const checkIsRebasing = (cwd: string): boolean =>
  existsSync(resolve(cwd, runGit(["rev-parse", "--git-path", "rebase-merge"], cwd).trim()));
