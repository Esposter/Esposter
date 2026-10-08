import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// The review config as a branch carries it. CodeRabbit reads `.coderabbit.yaml` from a pull request's base, so a
// Window's review applies the copy its base carries (`checkIsStackingAllowed`). A branch without the file holds no stacking.
export const readCoderabbitConfig = (branchName: string, cwd?: string): string =>
  getResult(() => runGit(["show", `origin/${branchName}:.coderabbit.yaml`], cwd)).unwrapOr("");
