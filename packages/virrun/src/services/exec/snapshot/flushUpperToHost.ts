import { buildFlushPlan } from "@/services/exec/snapshot/buildFlushPlan";
import { OVERLAY_APPLY_SCRIPT, OVERLAY_PROBE_SCRIPT } from "@/services/exec/snapshot/constants";
import { parseOverlayEntryKind } from "@/services/exec/snapshot/parseOverlayEntryKind";
import { parseOverlayManifest } from "@/services/exec/snapshot/parseOverlayManifest";
import { runOverlayScript } from "@/services/exec/snapshot/runOverlayScript";
// Reconcile a persist run's overlay upper onto the host so disk matches native (specs/write-back.md): probe the
// Upper Linux-side, classify + order the entries in TS, apply the plan Linux-side.
export const flushUpperToHost = (upperDir: string, hostDir: string, snapshotUpperDir: string): void => {
  const manifest = parseOverlayManifest(runOverlayScript(OVERLAY_PROBE_SCRIPT, [upperDir, snapshotUpperDir]));
  const snapshotLowerPaths = new Set(
    manifest.filter((entry) => entry.isSnapshotLowerPath).map((entry) => entry.relativePath),
  );
  // Skip a path if it or any ancestor is supplied by the snapshot lower: a new file written into node_modules
  // (e.g. a build's node_modules/.vite cache) has no snapshot entry of its own but must still not reach the host.
  const isUnderSnapshotLower = (relativePath: string): boolean => {
    const segments = relativePath.split("/");
    for (let depth = 1; depth <= segments.length; depth++)
      if (snapshotLowerPaths.has(segments.slice(0, depth).join("/"))) return true;
    return false;
  };
  const entries = manifest.map((entry) => ({
    kind: parseOverlayEntryKind(entry, entry.isOpaque),
    relativePath: entry.relativePath,
  }));
  const plan = buildFlushPlan(entries, isUnderSnapshotLower);
  if (plan.length > 0) runOverlayScript(OVERLAY_APPLY_SCRIPT, [upperDir, hostDir], JSON.stringify(plan));
};
