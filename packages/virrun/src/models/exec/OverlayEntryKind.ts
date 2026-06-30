// How an overlayfs upper entry is reconciled onto the host during write-back (specs/write-back.md).
export enum OverlayEntryKind {
  // Directory removed-and-recreated (user.overlay.opaque): clear the host copy before copying its children.
  OpaqueDir = "opaqueDir",
  // Created or modified file/dir — copy over the host path.
  Regular = "regular",
  // Deletion marker (character device, rdev 0:0) — remove the host path.
  Whiteout = "whiteout",
}
