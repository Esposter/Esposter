import { CITING_PATHSPECS } from "#src/services/citations/constants";
import { getSweepFilePaths } from "#src/services/sweeps/getSweepFilePaths";
import { AGENT_WORKTREES_DIRECTORY } from "@esposter/configuration";

// Every page that cites, in one `git ls-files` over all the pathspecs. The worktrees directory is machine-local and
// Gitignored, so it holds another checkout's pages rather than this one's.
export const readCitingPaths = (): string[] =>
  getSweepFilePaths(...CITING_PATHSPECS).filter(
    (path) => path.endsWith(".md") && !path.startsWith(AGENT_WORKTREES_DIRECTORY),
  );
