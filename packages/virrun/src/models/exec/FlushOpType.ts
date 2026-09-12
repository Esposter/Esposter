// One host-side operation in a write-back flush plan (buildFlushPlan, apps/web/content/docs/virrun/write-back.md).
export enum FlushOpType {
  // Copy the upper entry onto the host (mkdir for a directory, overwrite for a file).
  Copy = "copy",
  // Remove the host path recursively — a deletion, or clearing an opaque directory.
  Delete = "delete",
}
