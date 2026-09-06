import type { FlushOpType } from "#src/models/exec/FlushOpType";

export interface FlushOp {
  readonly relativePath: string;
  readonly type: FlushOpType;
}
