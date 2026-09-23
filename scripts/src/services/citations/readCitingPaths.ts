import { CITING_PATHSPECS } from "#src/services/citations/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { AGENT_WORKTREES_DIRECTORY } from "@esposter/configuration";

// Every page that cites, in one `git ls-files` over all the pathspecs. The worktrees directory is machine-local and
// Gitignored, so it holds another checkout's pages rather than this one's.
export const readCitingPaths = (): string[] =>
  readSweepFilePaths(...CITING_PATHSPECS).filter(
    (path) => path.endsWith(".md") && !path.startsWith(AGENT_WORKTREES_DIRECTORY),
  );
