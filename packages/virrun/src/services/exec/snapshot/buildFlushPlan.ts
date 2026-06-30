import type { FlushOp } from "@/models/exec/FlushOp";
import type { OverlayEntry } from "@/models/exec/OverlayEntry";

import { FlushOpType } from "@/models/exec/FlushOp";
import { OverlayEntryKind } from "@/models/exec/OverlayEntryKind";
// Copies run parent-first: shallower paths (fewer segments) first so a directory is created before the files inside
// It, ties broken lexicographically for a deterministic order.
const byDepthThenPath = (a: FlushOp, b: FlushOp): number =>
  a.relativePath.split("/").length - b.relativePath.split("/").length || a.relativePath.localeCompare(b.relativePath);
// Turn a classified overlay-upper walk into the ordered host operations that reproduce the command's writes on the
// Host working dir (specs/write-back.md). Pure — the walk, the actual fs ops, and the snapshot-lower lookup all
// Live in the caller (flushUpperToHost), so the ordering logic stays unit-testable on any platform.
//
// IsSnapshotLowerPath drops entries supplied by the warm snapshot lower (the node_modules/dep-tree closure): a
// Write into one is sandbox-internal (a postinstall patch, a `node_modules/.vite` cache), not host state, so
// Flushing it would re-materialize dependencies on disk. This is structural — layer membership — not a name guess.
//
// Ordering guarantees:
//   - every delete runs before every copy, so an opaque dir is cleared before its replacement children are copied;
//   - copies run parent-first (by path depth, then lexicographically), so a directory is created before the files
//     Inside it.
// An opaque dir expands to both a delete (clear the stale host dir) and a copy (recreate it); its upper children
// Arrive as their own Regular copies, so the dir is repopulated by the subsequent copies.
export const buildFlushPlan = (
  entries: readonly OverlayEntry[],
  isSnapshotLowerPath: (relativePath: string) => boolean,
): FlushOp[] => {
  const deletes: FlushOp[] = [];
  const copies: FlushOp[] = [];
  for (const { kind, relativePath } of entries)
    if (isSnapshotLowerPath(relativePath)) continue;
    else if (kind === OverlayEntryKind.Whiteout) deletes.push({ relativePath, type: FlushOpType.Delete });
    else if (kind === OverlayEntryKind.OpaqueDir) {
      deletes.push({ relativePath, type: FlushOpType.Delete });
      copies.push({ relativePath, type: FlushOpType.Copy });
    } else copies.push({ relativePath, type: FlushOpType.Copy });
  return [...deletes, ...copies.toSorted(byDepthThenPath)];
};
