import type { CitingPage } from "#src/models/citations/CitingPage";

import { CITING_PATHSPECS } from "#src/services/citations/constants";
import { getCitingText } from "#src/services/citations/getCitingText";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getSweepFilePaths } from "#src/services/sweeps/getSweepFilePaths";
import { AGENT_WORKTREES_DIRECTORY } from "@esposter/configuration";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// The pathspecs overlap (a README under `.agents/` matches two), so the pages are deduplicated before reading. The
// Worktrees directory is machine-local and gitignored, so it holds another checkout's pages rather than this one's.
export const readCitingPages = (): CitingPage[] =>
  [...new Set(CITING_PATHSPECS.flatMap((pathspec) => getSweepFilePaths(pathspec)))]
    .filter((path) => path.endsWith(".md") && !path.startsWith(AGENT_WORKTREES_DIRECTORY))
    .map((path) => ({ path, text: getCitingText(readFileSync(resolve(REPOSITORY_ROOT, path), "utf8")) }));
