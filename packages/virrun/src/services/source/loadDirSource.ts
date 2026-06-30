import type { DirSource } from "@/models/source/DirSource";
import type { LoadedSource } from "@/models/source/LoadedSource";
// The dir already exists on disk, so it is used as-is — no copy, no teardown.
export const loadDirSource = (source: DirSource): Promise<LoadedSource> =>
  Promise.resolve({
    cwd: source.dir,
    dispose: () => Promise.resolve(),
  });
