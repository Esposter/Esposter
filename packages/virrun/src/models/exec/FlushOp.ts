// One host-side operation in a write-back flush plan (buildFlushPlan, specs/write-back.md).
export enum FlushOpType {
  // Copy the upper entry onto the host (mkdir for a dir, overwrite for a file).
  Copy = "copy",
  // Remove the host path recursively — a deletion, or clearing an opaque dir.
  Delete = "delete",
}

export interface FlushOp {
  readonly relativePath: string;
  readonly type: FlushOpType;
}
