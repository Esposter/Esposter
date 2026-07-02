import type { Source } from "@/models/source/Source";
import type { BackendType } from "@/models/virrun/BackendType";
import type { Environment } from "@/models/virrun/Environment";

export interface VirrunOptions {
  backend: BackendType;
  // Framework whose source-derived artifacts the sandbox regenerates into a source-keyed prepare layer (os backend
  // Only; `none` disables it). Preset-driven — resolved to a concrete prepare step by resolvePrepareStep.
  environment: Environment;
  // Where the sandbox's files come from. Defaults to the current process cwd as a directory source.
  source: Source;
}
