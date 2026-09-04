import type { FlushOp } from "#src/models/exec/FlushOp";

import { buildFlushPlan } from "#src/services/exec/snapshot/buildFlushPlan";
import { checkIsUnderSnapshotLower } from "#src/services/exec/snapshot/checkIsUnderSnapshotLower";
import { OVERLAY_PROBE_SCRIPT } from "#src/services/exec/snapshot/constants";
import { parseOverlayEntryKind } from "#src/services/exec/snapshot/parseOverlayEntryKind";
import { parseOverlayManifest } from "#src/services/exec/snapshot/parseOverlayManifest";
import { runOverlayScript } from "#src/services/exec/snapshot/runOverlayScript";
// Probe a persist run's overlay upper Linux-side and classify + order its entries into a host flush plan
// (specs/write-back.md), skipping anything the snapshot lower supplies so node_modules never flushes, plus the
// Caller's `maskedPaths` (prepare outputs, and the source-mirror excludes on win32 — checkIsUnderSnapshotLower). Pure of
// Any host mutation (applyFlushPlan performs it), so the plan can be reused for both the host flush and the task cache.
export const buildHostFlushPlan = (
  upperDir: string,
  snapshotUpperDir: string,
  maskedPaths: readonly string[] = [],
): FlushOp[] => {
  const manifest = parseOverlayManifest(runOverlayScript(OVERLAY_PROBE_SCRIPT, [upperDir, snapshotUpperDir]));
  const snapshotLowerPaths = new Set(
    manifest.filter((entry) => entry.checkIsSnapshotLowerPath).map((entry) => entry.relativePath),
  );
  const entries = manifest.map((entry) => ({
    kind: parseOverlayEntryKind(entry, entry.isOpaque),
    relativePath: entry.relativePath,
  }));
  return buildFlushPlan(entries, (relativePath) => checkIsUnderSnapshotLower(relativePath, snapshotLowerPaths, maskedPaths));
};
