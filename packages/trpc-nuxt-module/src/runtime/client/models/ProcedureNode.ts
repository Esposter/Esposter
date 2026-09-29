import type { ProcedurePath } from "#src/runtime/client/models/ProcedurePath";

// Any node of the client — a procedure or a router — since each one is a proxy that answers `_def()` with its path
export interface ProcedureNode {
  readonly _def: () => ProcedurePath;
}
