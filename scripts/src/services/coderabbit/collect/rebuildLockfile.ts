import { spawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";
import { LOCKFILE } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { rmSync } from "node:fs";
import { join } from "node:path";

// A conflicted lockfile is never merged, hand or otherwise: it is deleted and rebuilt from the manifests the
// Merge already settled (`git` skill), then staged for whichever sequencer asked. Whether it was rebuilt is the
// Answer: an install that fails here leaves the conflict open for the resolver's session, which is told to
// Rebuild it the same way and can repair what broke the install, rather than ending the run on it.
export const rebuildLockfile = (cwd: string): boolean => {
  rmSync(join(cwd, LOCKFILE));
  if (spawnPnpm(["i"], { cwd, stdio: "inherit" }).status !== 0) return false;
  runGit(["add", LOCKFILE], cwd);
  return true;
};
