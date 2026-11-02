import { REMOTE_MAIN_REF } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// Whether `main` is an ancestor of `commit`, so a fast-forward of `main` to it can land. A window's end holds `main` only
// Once the queue's line has reached the commit that merged `main` in, so each window's end is asked, not the queue's tip
export const checkIsMainAncestor = (commit: string, cwd?: string): boolean =>
  getResult(() => runGit(["merge-base", "--is-ancestor", REMOTE_MAIN_REF, commit], cwd)).match(
    () => true,
    () => false,
  );
