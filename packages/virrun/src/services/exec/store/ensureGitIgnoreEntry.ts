import {
  GITIGNORE_FILENAME,
  VIRRUN_CACHE_DIRECTORY_NAME,
  VIRRUN_GITIGNORE_ENTRY,
} from "#src/services/exec/util/constants";
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
// Appends the cache directory to the workspace's .gitignore unless a line already ignores it in some form.
export const ensureGitIgnoreEntry = (workspaceRoot: string): void => {
  const gitignore = join(workspaceRoot, GITIGNORE_FILENAME);
  const gitignoreContent = existsSync(gitignore) ? readFileSync(gitignore, "utf8") : "";
  // Idempotent against any form the cache directory is already ignored under — `.virrun`, `/.virrun`, `.virrun/`,
  // `/.virrun/` — by normalizing each line to its bare name. Matching only the exact `/.virrun/` entry would
  // Re-append a redundant line whenever a repo already lists the directory in a different (equally valid) form.
  const isIgnored = gitignoreContent
    .split(/\r?\n/u)
    .some((line) => line.trim().replace(/^\/+/u, "").replace(/\/+$/u, "") === VIRRUN_CACHE_DIRECTORY_NAME);
  if (isIgnored) return;
  appendFileSync(
    gitignore,
    `${!gitignoreContent || gitignoreContent.endsWith("\n") ? "" : "\n"}${VIRRUN_GITIGNORE_ENTRY}\n`,
  );
};
