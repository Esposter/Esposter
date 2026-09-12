import type { ExecOptions } from "#src/models/exec/ExecOptions";
import type { ExecResult } from "#src/models/exec/ExecResult";
import type { BackendType } from "#src/models/virrun/BackendType";
// The single seam the whole project is built on. Every execution strategy — native passthrough, the
// In-process `vfs` backend and the RAM-backed `os` backend — implements this one interface, so adding a
// Backend never changes the public API. See apps/web/content/docs/virrun/execution-backends.md.
export interface ExecBackend {
  // A string is run through the host shell (operator passthrough, e.g. `virrun -- <cmd>`); a
  // Readonly string[] is run as argv with shell: false so structured data (repo URLs, refs) can
  // Never be interpreted as shell metacharacters or git options. See loadGitSource.
  exec: (command: readonly string[] | string, options: ExecOptions) => Promise<ExecResult>;
  readonly name: BackendType;
}
