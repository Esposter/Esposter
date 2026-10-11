import { runGit } from "#src/services/shared/runGit";
import { join } from "node:path";

// Where rerere keeps the resolutions it recorded: the common git directory, which every worktree of the checkout shares
export const readResolutionsDirectory = (cwd: string): string =>
  join(runGit(["rev-parse", "--path-format=absolute", "--git-common-dir"], cwd).trim(), "rr-cache");
