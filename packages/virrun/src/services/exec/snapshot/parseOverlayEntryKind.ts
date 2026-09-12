import type { OverlayEntryStats } from "#src/models/exec/snapshot/OverlayEntryStats";

import { OverlayEntryKind } from "#src/models/exec/snapshot/OverlayEntryKind";
// Classify one overlayfs upper entry (apps/web/content/docs/virrun/write-back.md, "Overlay upper format"). Pure: the
// Walk, lstat, and opaque read happen in the caller. Whiteout is checked first — a deletion marker is never a
// Directory.
export const parseOverlayEntryKind = (stats: OverlayEntryStats, isOpaque: boolean): OverlayEntryKind => {
  if (stats.isCharacterDevice && stats.rdev === 0) return OverlayEntryKind.Whiteout;
  else if (stats.isDirectory && isOpaque) return OverlayEntryKind.OpaqueDirectory;
  else return OverlayEntryKind.Regular;
};
