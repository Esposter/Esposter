import type { FlushOp } from "#src/models/exec/FlushOp";

import { PNPM_LOCKFILE_FILENAME } from "#src/services/exec/util/constants";
// Whether a persist run's flush plan mutated the dependency closure — i.e. the command was a write-network install
// (`pnpm install`/`add`/`update`), which resolves and fetches versions from the registry. Such a run's output is NOT
// Determined by the task-cache key (lockfile + source + command): it *changes* the lockfile the key is built from, and
// A warm store lets it succeed offline (so the net-unshare gate alone would still cache it). Recording it would replay
// A stale dependency closure onto the host, so the caller drops the entry — the run stays correct, merely uncached.
//
// The lockfile op is the whole signal: any dep mutation rewrites `pnpm-lock.yaml`, and it always reaches the flush plan
// As a source-tree path. node_modules itself never appears in a plan — `isUnderSnapshotLower` masks every path with a
// `node_modules` segment out of write-back structurally — so there is nothing else to test.
export const checkHasDependencyClosureMutation = (plan: readonly FlushOp[]): boolean =>
  plan.some(
    (op) => op.relativePath === PNPM_LOCKFILE_FILENAME || op.relativePath.endsWith(`/${PNPM_LOCKFILE_FILENAME}`),
  );
