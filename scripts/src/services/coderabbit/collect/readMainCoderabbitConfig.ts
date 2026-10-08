import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// The review config as `main` carries it, the copy the stacking guard is written against (`checkIsStackingAllowed`).
// A `main` without the file holds no stacking, so the collector runs one window at a time until the file reaches it.
export const readMainCoderabbitConfig = (cwd?: string): string =>
  getResult(() => runGit(["show", `origin/${MAIN_BRANCH}:.coderabbit.yaml`], cwd)).unwrapOr("");
