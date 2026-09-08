import { parseLockResolvedVersions } from "#scripts/outdatedDependencies/parseLockResolvedVersions";
import { sliceLockSection } from "#scripts/outdatedDependencies/sliceLockSection";

export const getLockCatalogVersions = (lockYaml: string): Map<string, string> =>
  parseLockResolvedVersions(
    sliceLockSection(lockYaml, "\ncatalogs:", ["\npackages:", "\nsnapshots:", "\nimporters:"]),
    4,
  );
