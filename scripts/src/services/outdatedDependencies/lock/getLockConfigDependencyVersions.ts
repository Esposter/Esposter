import {
  IMPORTER_PACKAGE_INDENT,
  IMPORTERS_SECTION_ENDS,
  IMPORTERS_SECTION_START,
} from "#src/services/outdatedDependencies/lock/constants";
import { parseLockResolvedVersions } from "#src/services/outdatedDependencies/lock/parseLockResolvedVersions";
import { sliceLockSection } from "#src/services/outdatedDependencies/lock/sliceLockSection";

export const getLockConfigDependencyVersions = (lockYaml: string): Map<string, string> =>
  parseLockResolvedVersions(
    sliceLockSection(lockYaml, IMPORTERS_SECTION_START, IMPORTERS_SECTION_ENDS),
    IMPORTER_PACKAGE_INDENT,
  );
