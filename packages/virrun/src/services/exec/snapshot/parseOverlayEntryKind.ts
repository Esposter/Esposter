import { OverlayEntryKind } from "@/models/exec/OverlayEntryKind";
// The lstat facts parseOverlayEntryKind needs (from a node fs.Stats or a fixture).
interface OverlayEntryStats {
  readonly isCharacterDevice: boolean;
  readonly isDirectory: boolean;
  readonly rdev: number;
}
// Classify one overlayfs upper entry (specs/write-back.md → "Overlay upper format"). Pure: the walk, lstat, and
// Opaque read happen in the caller. Whiteout is checked first — a deletion marker is never a directory.
export const parseOverlayEntryKind = (stats: OverlayEntryStats, isOpaque: boolean): OverlayEntryKind => {
  if (stats.isCharacterDevice && stats.rdev === 0) return OverlayEntryKind.Whiteout;
  else if (stats.isDirectory && isOpaque) return OverlayEntryKind.OpaqueDir;
  else return OverlayEntryKind.Regular;
};
