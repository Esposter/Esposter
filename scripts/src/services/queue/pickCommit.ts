import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// A pick that stopped with nothing to apply: no conflicted path, and an index equal to HEAD. The remote already
// Carries the commit's whole change, as when another session's push landed the same edit first
const checkIsEmptyPick = (cwd: string): boolean =>
  runGit(["diff", "--name-only", "--diff-filter=U"], cwd).trim() === "" &&
  getResult(() => runGit(["diff", "--cached", "--quiet", "HEAD"], cwd)).match(
    () => true,
    () => false,
  );

// Cherry-picks one commit onto the checkout at `cwd`. A pick that comes out empty is skipped, since there is nothing
// Left to replay, and never handed to the session that settles conflicts. A pick that stops on a conflict stays open
// For the caller to settle or abort
export const pickCommit = (commit: string, cwd: string): boolean =>
  getResult(() => runGit(["cherry-pick", commit], cwd)).match(
    () => true,
    () => {
      if (!checkIsEmptyPick(cwd)) return false;
      runGit(["cherry-pick", "--skip"], cwd);
      return true;
    },
  );
