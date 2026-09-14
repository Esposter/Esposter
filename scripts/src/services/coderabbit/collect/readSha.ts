import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getResult } from "@esposter/shared";

// The sha a ref points at, or `undefined` where the ref does not exist. `--verify --quiet` is what makes a
// Missing ref an exit code rather than a message on stdout, and the caller decides whether absence is a fault.
export const readSha = (ref: string, cwd?: string): string | undefined =>
  getResult(() => runGit(["rev-parse", "--verify", "--quiet", ref], cwd).trim()).unwrapOr(undefined);
