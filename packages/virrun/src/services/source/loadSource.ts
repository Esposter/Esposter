import type { LoadedSource } from "@/models/source/LoadedSource";
import type { Source } from "@/models/source/Source";

import { SourceType } from "@/models/source/SourceType";
import { reapStaleTemps } from "@/services/exec/snapshot/reapStaleTemps";
import { VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { loadDirSource } from "@/services/source/loadDirSource";
import { loadFilesSource } from "@/services/source/loadFilesSource";
import { loadGitSource } from "@/services/source/loadGitSource";
import { exhaustiveGuard } from "@esposter/shared";
import { tmpdir } from "node:os";
// Normalizes any source spec into a LoadedSource (working dir + teardown) by dispatching on its type. Before minting
// This run's own clone temp, reap any a hard-killed run stranded in the shared temp root — the git/files loaders'
// `mkdtemp` dir is torn down only by their in-process finalizer, and nothing else sweeps that root.
export const loadSource = (source: Source): Promise<LoadedSource> => {
  reapStaleTemps(tmpdir(), [VIRRUN_TEMP_DIR_PREFIX]);
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
