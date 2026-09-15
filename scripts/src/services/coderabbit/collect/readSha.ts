import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getResult } from "@esposter/shared";

// `--verify --quiet` makes a missing ref an exit code rather than a message on stdout
export const readSha = (ref: string, cwd?: string): string | undefined =>
  getResult(() => runGit(["rev-parse", "--verify", "--quiet", ref], cwd).trim()).unwrapOr(undefined);
