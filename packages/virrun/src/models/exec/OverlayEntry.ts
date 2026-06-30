import type { OverlayEntryKind } from "@/models/exec/OverlayEntryKind";
// One entry produced by walking an overlayfs upper layer: its path relative to the upper root (POSIX separators,
// So it maps onto both the upper and the host working dir) and how it must be reconciled. The walker reads each
// Entry's lstat + opaque xattr and classifies it via parseOverlayEntryKind; buildFlushPlan turns the list into an
// Ordered set of host operations. See specs/write-back.md.
export interface OverlayEntry {
  readonly kind: OverlayEntryKind;
  readonly relativePath: string;
}
