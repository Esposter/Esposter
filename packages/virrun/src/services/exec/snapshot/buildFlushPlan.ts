import type { FlushOp } from "#src/models/exec/FlushOp";
import type { OverlayEntry } from "#src/models/exec/snapshot/OverlayEntry";

import { FlushOpType } from "#src/models/exec/FlushOpType";
import { OverlayEntryKind } from "#src/models/exec/snapshot/OverlayEntryKind";
import { getPathDepth } from "#src/services/exec/snapshot/getPathDepth";
import { exhaustiveGuard } from "@esposter/shared";
// Order a classified overlay-upper walk into host ops (apps/web/content/docs/virrun/write-back.md). Deletes run before
// Copies so an opaque directory is cleared before its replacement children land; an opaque directory expands to a delete + a copy.
export const buildFlushPlan = (
  entries: readonly OverlayEntry[],
  checkIsSnapshotLowerPath: (relativePath: string) => boolean,
): FlushOp[] => {
  const deletes: FlushOp[] = [];
  const copies: FlushOp[] = [];
  for (const { kind, relativePath } of entries) {
    if (checkIsSnapshotLowerPath(relativePath)) continue;
    switch (kind) {
      case OverlayEntryKind.OpaqueDirectory:
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
    .map((copy) => ({ copy, depth: getPathDepth(copy.relativePath) }))
    .toSorted(
      (firstCopy, secondCopy) =>
        firstCopy.depth - secondCopy.depth || firstCopy.copy.relativePath.localeCompare(secondCopy.copy.relativePath),
    )
    .map(({ copy }) => copy);
  return [...deletes, ...sortedCopies];
};
