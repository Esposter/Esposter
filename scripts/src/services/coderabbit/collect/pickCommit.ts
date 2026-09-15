import { PickOutcome } from "#src/models/coderabbit/collect/PickOutcome";
import { readUnmergedPaths } from "#src/services/coderabbit/collect/readUnmergedPaths";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getResult } from "@esposter/shared";

// A failed cherry-pick's exit code says nothing about why, and the two reasons need opposite answers: an unmerged
// Path is a conflict the caller stops on, none means the patch is already in the tree under another sha
export const pickCommit = (sha: string, cwd: string): PickOutcome =>
  getResult(() => runGit(["cherry-pick", sha], cwd)).match(
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
