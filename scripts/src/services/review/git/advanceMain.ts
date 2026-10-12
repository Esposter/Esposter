import { MAIN_BRANCH } from "#src/services/review/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// Pushes the window's end to `main` as a plain fast-forward, never forced. Returns false when the push is rejected, since
// `main` moved meanwhile and the next run re-measures from there.
export const advanceMain = (end: string): boolean =>
  getResult(() => runGit(["push", "origin", `${end}:refs/heads/${MAIN_BRANCH}`])).match(
    () => true,
    (error) => {
      console.info(`main was not advanced to ${end}: ${error.message}`);
      return false;
    },
  );
