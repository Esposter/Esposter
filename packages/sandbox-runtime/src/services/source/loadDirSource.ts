import type { DirSource } from "@/models/source/DirSource";
import type { LoadedSource } from "@/models/source/LoadedSource";
// The cheapest loader: the directory already exists on disk, so it becomes the working directory
// As-is with no copy and nothing to tear down.
export const loadDirSource = (source: DirSource): Promise<LoadedSource> =>
  Promise.resolve({
    cwd: source.dir,
    dispose: () => Promise.resolve(),
  });
