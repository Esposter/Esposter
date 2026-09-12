import {
  VIRRUN_SOURCE_MIRROR_ARCHIVE_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_COPY_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_DELETE_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_MANIFEST_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_ORIGIN_TEMP_PREFIX,
} from "#src/services/exec/wsl/constants";
import { reapStaleTempFiles } from "#src/services/exec/wsl/reapStaleTempFiles";
// The planner stages these pid-tagged temps (next manifest + origin marker + archive + copy/delete lists) into the
// Mirror entry directory, and the plan/script removes them on success — a hard-killed run strands them. The published bare
// Names (manifest.json, origin, tree) carry no pid tag and are always kept.
const TEMP_PREFIXES = [
  VIRRUN_SOURCE_MIRROR_MANIFEST_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_ORIGIN_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_ARCHIVE_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_COPY_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_DELETE_TEMP_PREFIX,
];

export const reapStaleSourceMirrorTemps = (entryUnc: string): void => {
  reapStaleTempFiles(entryUnc, TEMP_PREFIXES);
};
