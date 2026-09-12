import { parseLockResolvedVersions } from "#src/services/outdatedDependencies/lock/parseLockResolvedVersions";
import { sliceLockSection } from "#src/services/outdatedDependencies/lock/sliceLockSection";

export const getLockCatalogVersions = (lockYaml: string): Map<string, string> =>
  parseLockResolvedVersions(
    sliceLockSection(lockYaml, "\ncatalogs:", ["\npackages:", "\nsnapshots:", "\nimporters:"]),
    4,
  );
