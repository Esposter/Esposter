import { PickOutcome } from "#src/models/coderabbit/collect/PickOutcome";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { getResult } from "@esposter/shared";

// A cherry-pick that fails says nothing about why in its exit code, and the two reasons need opposite answers:
// An unmerged path is a real conflict the caller stops on, and no unmerged path means the patch is already in
// The tree under another sha, which is nothing owed. Reading the index is what tells them apart.
export const pickCommit = (sha: string, cwd: string): PickOutcome =>
  getResult(() => runGit(["cherry-pick", sha], cwd)).match(
    () => PickOutcome.Applied,
    () => {
      const unmerged = getNonEmptyLines(runGit(["diff", "--name-only", "--diff-filter=U"], cwd));
      if (unmerged.length > 0) {
        runGit(["cherry-pick", "--abort"], cwd);
        return PickOutcome.Conflict;
      }
      runGit(["cherry-pick", "--skip"], cwd);
      return PickOutcome.Empty;
    },
  );
