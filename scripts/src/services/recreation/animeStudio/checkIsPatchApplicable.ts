import { spawnSync } from "@esposter/shared-node/child-process";

// Whether a patch applies to a tree, forward or with the given options: `git apply --check` exits 0 only when it does
export const checkIsPatchApplicable = (directory: string, patchPath: string, ...options: string[]): boolean =>
  spawnSync("git", ["apply", "--check", ...options, patchPath], { cwd: directory, stdio: "ignore" }).status === 0;
