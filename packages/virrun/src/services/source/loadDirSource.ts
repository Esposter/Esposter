import type { DirSource } from "#src/models/source/DirSource";
import type { LoadedSource } from "#src/models/source/LoadedSource";
// The dir already exists on disk, so it is used as-is — no copy, no teardown.
export const loadDirSource = (source: DirSource): Promise<LoadedSource> =>
  Promise.resolve({
    cwd: source.dir,
    dispose: () => Promise.resolve(),
  });
