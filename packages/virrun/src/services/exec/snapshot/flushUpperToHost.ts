import { buildFlushPlan } from "@/services/exec/snapshot/buildFlushPlan";
import { OVERLAY_APPLY_SCRIPT, OVERLAY_PROBE_SCRIPT } from "@/services/exec/snapshot/constants";
import { parseOverlayEntryKind } from "@/services/exec/snapshot/parseOverlayEntryKind";
import { parseOverlayManifest } from "@/services/exec/snapshot/parseOverlayManifest";
import { runOverlayScript } from "@/services/exec/snapshot/runOverlayScript";
// Reconcile a persist run's overlay upper onto the host working dir so the on-disk result matches native
// (specs/write-back.md). Probe the upper Linux-side for raw facts, classify + order them in TS (the tested logic),
// Then apply the resulting plan Linux-side. snapshotUpperDir is the warm snapshot's upper: the probe marks any path
// It also supplies (a node_modules/dep-tree write) so buildFlushPlan drops it — node_modules never reaches the host.
// An empty plan (the command wrote nothing beyond the warm baseline) skips the apply entirely.
export const flushUpperToHost = (upperDir: string, hostDir: string, snapshotUpperDir: string): void => {
  const manifest = parseOverlayManifest(runOverlayScript(OVERLAY_PROBE_SCRIPT, [upperDir, snapshotUpperDir]));
  const snapshotLowerPaths = new Set(
    manifest.filter((entry) => entry.isSnapshotLowerPath).map((entry) => entry.relativePath),
  );
  const entries = manifest.map((entry) => ({
    kind: parseOverlayEntryKind(entry, entry.isOpaque),
    relativePath: entry.relativePath,
  }));
  const plan = buildFlushPlan(entries, (relativePath) => snapshotLowerPaths.has(relativePath));
  if (plan.length > 0) runOverlayScript(OVERLAY_APPLY_SCRIPT, [upperDir, hostDir], JSON.stringify(plan));
};
