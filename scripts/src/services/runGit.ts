import { REPOSITORY_ROOT } from "#src/services/constants";
import { execFileSync } from "node:child_process";

// Every answer is against the repository root: with `diff.relative` set, a `git diff` run from this package's own
// Directory answers about `scripts/` alone — a short, clean-looking number.
export const runGit = (args: string[]): string => execFileSync("git", args, { cwd: REPOSITORY_ROOT, encoding: "utf8" });
