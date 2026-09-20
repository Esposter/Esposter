import { PickOutcome } from "#src/models/coderabbit/collect/PickOutcome";
import { readUnmergedPaths } from "#src/services/coderabbit/collect/readUnmergedPaths";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// `-x` names the original in the copy's message, which is how a port survives its patch id drifting
// (`readCherryShas`). A failed cherry-pick's exit code says nothing about why, and the two reasons need opposite
// Answers: an unmerged path is a conflict the caller stops on, none means the patch is already in the tree under
// Another sha
export const pickCommit = (sha: string, cwd: string): PickOutcome =>
  getResult(() => runGit(["cherry-pick", "-x", sha], cwd)).match(
    () => PickOutcome.Applied,
    () => {
      if (readUnmergedPaths(cwd).length > 0) {
        runGit(["cherry-pick", "--abort"], cwd);
        return PickOutcome.Conflict;
      }
      runGit(["cherry-pick", "--skip"], cwd);
      return PickOutcome.Empty;
    },
  );
