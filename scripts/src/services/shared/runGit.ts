import { MAX_BUFFER_BYTES, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getGitEnv } from "#src/services/shared/getGitEnv";
import { execFileSync } from "node:child_process";

// Against the repository root: with `diff.relative` set, a `git diff` run from `scripts/` answers about
// `scripts/` alone. The dry run passes its throwaway worktree instead, which only `getGitEnv` makes binding.
export const runGit = (args: string[], cwd: string = REPOSITORY_ROOT): string =>
  execFileSync("git", args, { cwd, encoding: "utf8", env: getGitEnv(), maxBuffer: MAX_BUFFER_BYTES });
