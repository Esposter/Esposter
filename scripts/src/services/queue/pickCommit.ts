import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// Cherry-picks one commit onto the checkout at `cwd`. A pick that stops stays open for the caller to settle or abort
export const pickCommit = (commit: string, cwd: string): boolean =>
  getResult(() => runGit(["cherry-pick", commit], cwd)).match(
    () => true,
    () => false,
  );
