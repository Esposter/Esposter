import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { ExecResult } from "@/models/exec/ExecResult";
// The single seam the whole project is built on. Every execution strategy — native passthrough
// today, the in-process `vfs` backend and the RAM-backed `os` backend later — implements this one
// interface, so adding a backend never changes the public API. See
// features/sandbox-runtime/specs/exec-isolation.md.
export interface ExecBackend {
  exec: (command: string, options: ExecOptions) => Promise<ExecResult>;
  readonly name: string;
}
