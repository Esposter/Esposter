import type { PrepareLocation } from "@/models/exec/snapshot/PrepareLocation";
import type { PrepareStep } from "@/models/virrun/PrepareStep";

import { computeSourceTreeHash } from "@/services/exec/cache/computeSourceTreeHash";
import { computeLockfileHash } from "@/services/exec/snapshot/computeLockfileHash";
import { VIRRUN_PREPARE_DIRECTORY_NAME, VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { resolveWorkspaceRoot } from "@/services/exec/util/resolveWorkspaceRoot";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { join } from "node:path";
// Resolves a prepare layer's host-global address without materializing anything. Keyed off (a) the lockfile hash —
// The prepare runs over that dep closure — (b) the workspace source-tree hash (reused from the task cache; git-based,
// Cheap on a clean tree, moves on any staged/unstaged/untracked change) so editing source re-provisions the layer
// While the deps snapshot is untouched, and (c) the resolved prepare step, so changing the environment preset can't
// Serve a layer built for another. The source hash is taken at the workspace root so the key is stable regardless of
// Which subdirectory virrun was invoked from. A non-git repo yields a null source hash → one static entry (the layer
// Still works, it just won't auto-refresh on source edits, matching the freeze fallback).
export const resolvePrepareLocation = (cwd: string, prepareStep: PrepareStep): PrepareLocation => {
  const key = createHash("sha256")
    .update(computeLockfileHash(cwd))
    .update("\0")
    .update(computeSourceTreeHash(resolveWorkspaceRoot(cwd)) ?? "")
    .update("\0")
    .update(prepareStep.command)
    .update("\0")
    .update(prepareStep.outputs.join("\0"))
    .digest("hex");
  const dir = join(getGlobalCacheDirectory(), VIRRUN_PREPARE_DIRECTORY_NAME, key);
  const upperDir = join(dir, VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME);
  return { dir, exists: existsSync(upperDir), key, upperDir };
};
