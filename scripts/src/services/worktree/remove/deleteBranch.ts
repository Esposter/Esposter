import { REMOTE_QUEUE_REF } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// A branch whose tip origin/ai/queue once held has landed, even where `-d` would refuse it as unmerged into the current
// Branch; any other is left to `-d`, which refuses one holding unlanded commits
export const deleteBranch = (branch: string, repositoryRoot: string): void => {
  const forkPoint = getResult(() =>
    runGit(["merge-base", "--fork-point", REMOTE_QUEUE_REF, branch], repositoryRoot),
  ).match(
    (point) => point.trim(),
    () => "",
  );
  const tip = runGit(["rev-parse", branch], repositoryRoot).trim();
  runGit(["branch", forkPoint === tip ? "-D" : "-d", branch], repositoryRoot);
};
