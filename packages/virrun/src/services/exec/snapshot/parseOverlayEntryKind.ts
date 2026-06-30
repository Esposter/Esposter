import { OverlayEntryKind } from "@/models/exec/OverlayEntryKind";
// The lstat facts parseOverlayEntryKind needs, named so the caller can feed a node fs.Stats
// (`{ isCharacterDevice: st.isCharacterDevice(), isDirectory: st.isDirectory(), rdev: st.rdev }`) or a fixture.
interface OverlayEntryStats {
  readonly isCharacterDevice: boolean;
  readonly isDirectory: boolean;
  readonly rdev: number;
}
// Classify one overlayfs upper entry for write-back (specs/write-back.md → "Overlay upper format"). Pure: the
// Directory walk, the lstat, and the user.overlay.opaque read all happen in the caller, so this stays unit-testable
// On any platform. A whiteout is overlay's deletion marker — a character device with rdev 0:0 — and is detected by
// Lstat alone (no xattr needed). A directory carrying the opaque marker was removed-and-recreated, so its host copy
// Must be cleared first. Everything else is a plain copy. The whiteout check comes first because a deletion marker
// Is never also a directory, and the opaque check is meaningless on a non-directory.
export const parseOverlayEntryKind = (stats: OverlayEntryStats, isOpaque: boolean): OverlayEntryKind => {
  if (stats.isCharacterDevice && stats.rdev === 0) return OverlayEntryKind.Whiteout;
  else if (stats.isDirectory && isOpaque) return OverlayEntryKind.OpaqueDir;
  else return OverlayEntryKind.Regular;
};
