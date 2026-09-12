// How an overlayfs upper entry is reconciled onto the host during write-back
// (apps/web/content/docs/virrun/write-back.md).
export enum OverlayEntryKind {
  // Directory removed-and-recreated (user.overlay.opaque): clear the host copy before copying its children.
  OpaqueDirectory = "opaqueDir",
  // Created or modified file/directory — copy over the host path.
  Regular = "regular",
  // Deletion marker (character device, rdev 0:0) — remove the host path.
  Whiteout = "whiteout",
}
