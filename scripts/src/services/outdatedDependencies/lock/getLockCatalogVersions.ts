import {
  CATALOG_PACKAGE_INDENT,
  CATALOGS_SECTION_ENDS,
  CATALOGS_SECTION_START,
} from "#src/services/outdatedDependencies/lock/constants";
import { parseLockResolvedVersions } from "#src/services/outdatedDependencies/lock/parseLockResolvedVersions";
import { sliceLockSection } from "#src/services/outdatedDependencies/lock/sliceLockSection";

export const getLockCatalogVersions = (lockYaml: string): Map<string, string> =>
  parseLockResolvedVersions(
    sliceLockSection(lockYaml, CATALOGS_SECTION_START, CATALOGS_SECTION_ENDS),
    CATALOG_PACKAGE_INDENT,
  );
