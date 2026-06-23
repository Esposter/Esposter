import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { ExecResult } from "@/models/exec/ExecResult";
// The single seam the whole project is built on. Every execution strategy — native passthrough
// Today, the in-process `vfs` backend and the RAM-backed `os` backend later — implements this one
// Interface, so adding a backend never changes the public API. See
// Features/sandbox-runtime/specs/exec-isolation.md.
export interface ExecBackend {
  // A string is run through the host shell (operator passthrough, e.g. `sandbox -- <cmd>`); a
  // Readonly string[] is run as argv with shell: false so structured data (repo URLs, refs) can
  // Never be interpreted as shell metacharacters or git options. See loadGitSource.
  exec: (command: readonly string[] | string, options: ExecOptions) => Promise<ExecResult>;
  readonly name: string;
}
