import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

export const checkIsKnown = (commit: string, cwd?: string): boolean =>
  getResult(() => runGit(["rev-parse", "--verify", "--quiet", `${commit}^{commit}`], cwd)).match(
    () => true,
    () => false,
  );
