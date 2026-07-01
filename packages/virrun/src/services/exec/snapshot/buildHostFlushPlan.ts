import type { FlushOp } from "@/models/exec/FlushOp";

import { buildFlushPlan } from "@/services/exec/snapshot/buildFlushPlan";
import { OVERLAY_PROBE_SCRIPT } from "@/services/exec/snapshot/constants";
import { isUnderSnapshotLower } from "@/services/exec/snapshot/isUnderSnapshotLower";
import { parseOverlayEntryKind } from "@/services/exec/snapshot/parseOverlayEntryKind";
import { parseOverlayManifest } from "@/services/exec/snapshot/parseOverlayManifest";
import { runOverlayScript } from "@/services/exec/snapshot/runOverlayScript";
// Probe a persist run's overlay upper Linux-side and classify + order its entries into a host flush plan
// (specs/write-back.md), skipping anything the snapshot lower supplies so node_modules never flushes. Pure of any
// host mutation (applyFlushPlan performs it), so the plan can be reused for both the host flush and the task cache.
export const buildHostFlushPlan = (upperDir: string, snapshotUpperDir: string): FlushOp[] => {
  const manifest = parseOverlayManifest(runOverlayScript(OVERLAY_PROBE_SCRIPT, [upperDir, snapshotUpperDir]));
  const snapshotLowerPaths = new Set(
    manifest.filter((entry) => entry.isSnapshotLowerPath).map((entry) => entry.relativePath),
  );
  const entries = manifest.map((entry) => ({
    kind: parseOverlayEntryKind(entry, entry.isOpaque),
    relativePath: entry.relativePath,
  }));
  return buildFlushPlan(entries, (relativePath) => isUnderSnapshotLower(relativePath, snapshotLowerPaths));
};
