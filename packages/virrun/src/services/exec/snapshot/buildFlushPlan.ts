import type { FlushOp } from "@/models/exec/FlushOp";
import type { OverlayEntry } from "@/models/exec/OverlayEntry";

import { FlushOpType } from "@/models/exec/FlushOp";
import { OverlayEntryKind } from "@/models/exec/OverlayEntryKind";
import { exhaustiveGuard } from "@esposter/shared";
// Path depth = its "/" count; decorate-sort-undecorate below computes it once per copy (a build's upper can hold thousands).
const countSeparators = (relativePath: string): number => {
  let count = 0;
  for (const character of relativePath) if (character === "/") count++;
  return count;
};
// Order a classified overlay-upper walk into host ops (specs/write-back.md). Deletes run before copies so an opaque
// Dir is cleared before its replacement children land; an opaque dir expands to a delete + a copy.
export const buildFlushPlan = (
  entries: readonly OverlayEntry[],
  isSnapshotLowerPath: (relativePath: string) => boolean,
): FlushOp[] => {
  const deletes: FlushOp[] = [];
  const copies: FlushOp[] = [];
  for (const { kind, relativePath } of entries) {
    if (isSnapshotLowerPath(relativePath)) continue;
    switch (kind) {
      case OverlayEntryKind.OpaqueDir:
        deletes.push({ relativePath, type: FlushOpType.Delete });
        copies.push({ relativePath, type: FlushOpType.Copy });
        break;
      case OverlayEntryKind.Regular:
        copies.push({ relativePath, type: FlushOpType.Copy });
        break;
      case OverlayEntryKind.Whiteout:
        deletes.push({ relativePath, type: FlushOpType.Delete });
        break;
      default:
        exhaustiveGuard(kind);
    }
  }
  const sortedCopies = copies
    .map((copy) => ({ copy, depth: countSeparators(copy.relativePath) }))
    .toSorted((a, b) => a.depth - b.depth || a.copy.relativePath.localeCompare(b.copy.relativePath))
    .map(({ copy }) => copy);
  return [...deletes, ...sortedCopies];
};
