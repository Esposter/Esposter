// A single host-side operation in a write-back flush plan: copy an upper entry onto the host working dir, or
// Remove a host path (a whiteout deletion, or clearing an opaque dir before its replacement is copied in).
// See specs/write-back.md and buildFlushPlan.
export enum FlushOpType {
  // Copy the upper entry at relativePath onto the host working dir (mkdir for a dir, overwrite for a file).
  Copy = "copy",
  // Remove the host path at relativePath (recursively) — a deleted file/dir, or clearing an opaque dir.
  Delete = "delete",
}

export interface FlushOp {
  readonly relativePath: string;
  readonly type: FlushOpType;
}
