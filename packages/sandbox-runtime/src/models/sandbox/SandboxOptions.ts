import type { BackendType } from "@/models/sandbox/BackendType";
import type { Source } from "@/models/source/Source";

export interface SandboxOptions {
  backend: BackendType;
  // Where the sandbox's files come from. Defaults to the current process cwd as a directory source.
  source: Source;
}
