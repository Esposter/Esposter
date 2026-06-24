import type { Source } from "@/models/source/Source";
import type { BackendType } from "@/models/virrun/BackendType";

export interface VirrunOptions {
  backend: BackendType;
  // Where the sandbox's files come from. Defaults to the current process cwd as a directory source.
  source: Source;
}
