import { spawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { LOCKFILE } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { rmSync } from "node:fs";
import { join } from "node:path";

// A conflicted lockfile is never merged, hand or otherwise: it is deleted and rebuilt from the manifests the
// merge already settled (`git` skill), then staged for whichever sequencer asked. An install that fails here is
// a tree no resolution can reach, so it ends the run rather than the step.
export const rebuildLockfile = (cwd: string): void => {
  rmSync(join(cwd, LOCKFILE));
  if (spawnPnpm(["i"], { cwd, stdio: "inherit" }).status !== 0)
    throw new InvalidOperationError(Operation.Update, "coderabbit", "the lockfile could not be rebuilt");
  runGit(["add", LOCKFILE], cwd);
};
