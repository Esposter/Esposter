import type { DirectorySource } from "#src/models/source/DirectorySource";
import type { LoadedSource } from "#src/models/source/LoadedSource";
// The directory already exists on disk, so it is used as-is — no copy, no teardown.
export const loadDirectorySource = (source: DirectorySource): Promise<LoadedSource> =>
  Promise.resolve({
    cwd: source.directory,
    dispose: () => Promise.resolve(),
  });
