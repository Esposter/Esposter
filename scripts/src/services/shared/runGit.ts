import { MAX_BUFFER_BYTES, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getGitEnv } from "#src/services/shared/getGitEnv";
import { execFileSync } from "@esposter/shared-node/child-process";

// Against the repository root: with `diff.relative` set, a `git diff` run from `scripts/` answers about
// `scripts/` alone. The dry run passes its throwaway worktree instead, which only `getGitEnv` makes binding. `input` is
// Written to the command's stdin, for the commands that read nothing else (`git patch-id`) and for a revision list too
// Long for the command line (`--stdin`). A call given a `timeout` is killed past it, by the default SIGTERM that git
// Answers by removing the lock files it holds, and throws like any failed one: node closes the pipes git's transport
// Still holds, so a remote that never answers cannot hold it
export const runGit = (args: string[], cwd: string = REPOSITORY_ROOT, input?: string, timeout?: number): string =>
  execFileSync("git", args, { cwd, encoding: "utf8", env: getGitEnv(), input, maxBuffer: MAX_BUFFER_BYTES, timeout });
