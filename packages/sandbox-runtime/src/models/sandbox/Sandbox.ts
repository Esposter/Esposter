import type { ExecStdio } from "@/models/exec/ExecOptions";
import type { ExecResult } from "@/models/exec/ExecResult";
// The public handle returned by createSandbox. Deliberately tiny for the MVP — exec and the
// resolved backend name. Snapshot/fork (specs/snapshot-fork.md) will extend this surface later.
export interface Sandbox {
  readonly backend: string;
  exec: (command: string, stdio?: ExecStdio) => Promise<ExecResult>;
}
