import type { LoadedSource } from "#src/models/source/LoadedSource";
import type { Source } from "#src/models/source/Source";

import { SourceType } from "#src/models/source/SourceType";
import { loadDirSource } from "#src/services/source/loadDirSource";
import { loadFilesSource } from "#src/services/source/loadFilesSource";
import { loadGitSource } from "#src/services/source/loadGitSource";
import { exhaustiveGuard } from "@esposter/shared";
// Normalizes any source spec into a LoadedSource (working dir + teardown) by dispatching on its type. A git/files
// Clone's `mkdtemp` temp lives in `os.tmpdir()` and is torn down by its own in-process finalizer on a clean exit; a
// Hard-killed run's leak there is left to the OS's tmp reaping (reboot / systemd-tmpfiles), never swept here — the
// Root is shared and concurrent, so a blanket sweep would delete a *live* sibling run's clone.
export const loadSource = (source: Source): Promise<LoadedSource> => {
  switch (source.type) {
    case SourceType.Dir:
      return loadDirSource(source);
    case SourceType.Files:
      return loadFilesSource(source);
    case SourceType.Git:
      return loadGitSource(source);
    default:
      return exhaustiveGuard(source);
  }
};
