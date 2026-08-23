import type { Source } from "#src/models/source/Source";
import type { BackendType } from "#src/models/virrun/BackendType";
import type { Environment } from "#src/models/virrun/Environment";

export interface VirrunOptions {
  backend: BackendType;
  // Framework whose source-derived artifacts the sandbox regenerates into a source-keyed prepare layer (os backend
  // Only). Preset-driven — resolved to a concrete prepare step by resolvePrepareStep. Optional: `undefined` is no
  // Preset, which disables the layer.
  environment?: Environment;
  // Where the sandbox's files come from. Defaults to the current process cwd as a directory source.
  source: Source;
}
