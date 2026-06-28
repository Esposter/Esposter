import type { SnapshotLocation } from "@/models/exec/SnapshotLocation";

import { computeLockfileHash } from "@/services/exec/snapshot/computeLockfileHash";
import {
  VIRRUN_CACHE_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME,
  VIRRUN_SNAPSHOTS_DIRECTORY_NAME,
} from "@/services/exec/util/constants";
import { existsSync } from "node:fs";
import { join } from "node:path";
// Resolves where a repo's warm snapshot lives without materializing anything: keyed by the lockfile hash
// Under `.virrun/snapshots/<hash>` (mirroring the shared store's `.virrun/store/pnpm` addressing). `exists`
// Reflects whether the upper layer is already on disk, so the orchestrator can fork an existing snapshot or
// Fall through to a capture run. Pure addressing — the capture run owns creating upperDir/workDir lazily.
export const resolveSnapshotLocation = (cwd: string): SnapshotLocation => {
  const dir = cwd === "" ? process.cwd() : cwd;
  const hash = computeLockfileHash(dir);
  const snapshotDir = join(dir, VIRRUN_CACHE_DIRECTORY_NAME, VIRRUN_SNAPSHOTS_DIRECTORY_NAME, hash);
  const upperDir = join(snapshotDir, VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME);
  return {
    dir: snapshotDir,
    exists: existsSync(upperDir),
    hash,
    upperDir,
    workDir: join(snapshotDir, VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME),
  };
};
