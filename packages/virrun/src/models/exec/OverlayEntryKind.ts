// How a single entry in an overlayfs upper layer must be reconciled onto the host working dir during write-back
// (specs/write-back.md). Determined from the entry's lstat + the user.overlay.opaque xattr — both readable
// Unprivileged because a rootless bubblewrap overlay mounts with userxattr.
export enum OverlayEntryKind {
  // A directory the command removed and recreated (carries user.overlay.opaque="y"). The lower's contents are
  // Fully masked, so the host copy must be cleared before the upper's children are copied in.
  OpaqueDir = "opaqueDir",
  // A created or copied-up file/dir — copy it over the host path as-is.
  Regular = "regular",
  // A deletion marker: a character device with rdev 0:0. The command removed this path, so remove it on the host.
  Whiteout = "whiteout",
}
