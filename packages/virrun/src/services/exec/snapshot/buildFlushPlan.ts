import type { FlushOp } from "@/models/exec/FlushOp";
import type { OverlayEntry } from "@/models/exec/OverlayEntry";

import { FlushOpType } from "@/models/exec/FlushOp";
import { OverlayEntryKind } from "@/models/exec/OverlayEntryKind";
// Path depth = its "/" count, scanned (not split) so no throwaway array is allocated, and computed once per copy
// (decorate-sort-undecorate below) so the comparator never recomputes it — a build's upper can hold thousands.
const countSeparators = (relativePath: string): number => {
  let count = 0;
  for (const character of relativePath) if (character === "/") count++;
  return count;
};
// Order a classified overlay-upper walk into host ops (specs/write-back.md). Pure — the fs ops and the
// Snapshot-lower lookup live in flushUpperToHost. Deletes run before copies so an opaque dir is cleared before its
// Replacement children land; an opaque dir expands to a delete + a copy. isSnapshotLowerPath drops dep-tree
// (node_modules) writes — structural, not a name guess.
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
  const sortedCopies = copies
    .map((copy) => ({ copy, depth: countSeparators(copy.relativePath) }))
    .toSorted((a, b) => a.depth - b.depth || a.copy.relativePath.localeCompare(b.copy.relativePath))
    .map(({ copy }) => copy);
  return [...deletes, ...sortedCopies];
};
