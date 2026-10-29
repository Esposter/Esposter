import { runGit } from "#src/services/shared/runGit";
import { dirname } from "node:path";

// Every linked worktree shares the main checkout's git directory, so the root of the main checkout is the parent of the
// Common one, whichever checkout the command runs in
export const readMainCheckoutRoot = (): string =>
  dirname(runGit(["rev-parse", "--path-format=absolute", "--git-common-dir"]).trim());
