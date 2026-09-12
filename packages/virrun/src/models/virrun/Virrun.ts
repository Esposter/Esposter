import type { ExecResult } from "#src/models/exec/ExecResult";
import type { ExecStdio } from "#src/models/exec/ExecStdio";
import type { BackendType } from "#src/models/virrun/BackendType";
// The public handle returned by createVirrun. exec runs a command in the resolved backend; fork runs one over a
// Warm snapshot (apps/web/content/docs/virrun/snapshot-and-fork.md). Deliberately tiny — backend name, exec, fork,
// Dispose.
export interface Virrun {
  readonly backend: BackendType;
  // Tears down any temp state the source materialized. Always safe to call; a no-op for a directory source.
  dispose: () => Promise<void>;
  exec: (command: readonly string[] | string, stdio?: ExecStdio) => Promise<ExecResult>;
  // Runs a command over a warm dependency snapshot, provisioning it first if needed
  // (apps/web/content/docs/virrun/snapshot-and-fork.md). Os backend only — other backends have no overlay layer, so
  // Fork is identical to exec.
  fork: (command: readonly string[] | string, stdio?: ExecStdio) => Promise<ExecResult>;
  // Like fork, but PERSISTS the command's produced files back to the host so a mutation command (eslint --fix,
  // Db:gen, build) leaves disk exactly as native would (apps/web/content/docs/virrun/write-back.md); node_modules
  // (the read-only snapshot lower) never flushes. Os backend only; other backends plain-exec.
  persist: (command: readonly string[] | string, stdio?: ExecStdio) => Promise<ExecResult>;
}
