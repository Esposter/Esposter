import type { LoadedSource } from "@/models/source/LoadedSource";
import type { Source } from "@/models/source/Source";

import { SourceType } from "@/models/source/SourceType";
import { loadDirSource } from "@/services/source/loadDirSource";
import { loadFilesSource } from "@/services/source/loadFilesSource";
import { loadGitSource } from "@/services/source/loadGitSource";
import { exhaustiveGuard } from "@esposter/shared";
// Normalizes any source spec into a LoadedSource (working dir + teardown) by dispatching on its type.
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
