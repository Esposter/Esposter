import { parseLockResolvedVersions } from "#src/outdatedDependencies/parseLockResolvedVersions";
import { sliceLockSection } from "#src/outdatedDependencies/sliceLockSection";

export const getLockCatalogVersions = (lockYaml: string): Map<string, string> =>
  parseLockResolvedVersions(
    sliceLockSection(lockYaml, "\ncatalogs:", ["\npackages:", "\nsnapshots:", "\nimporters:"]),
    4,
  );
