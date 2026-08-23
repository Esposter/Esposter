import type { OverlayEntryKind } from "#src/models/exec/snapshot/OverlayEntryKind";
// A classified overlayfs upper entry: its path relative to the upper root (POSIX separators) and how to reconcile
// It. See specs/write-back.md.
export interface OverlayEntry {
  readonly kind: OverlayEntryKind;
  readonly relativePath: string;
}
