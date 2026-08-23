import { parseLockResolvedVersions } from "#scripts/checkDependencies/parseLockResolvedVersions";
import { sliceLockSection } from "#scripts/checkDependencies/sliceLockSection";

export const getLockCatalogVersions = (lockYaml: string): Map<string, string> =>
  parseLockResolvedVersions(
    sliceLockSection(lockYaml, "\ncatalogs:", ["\npackages:", "\nsnapshots:", "\nimporters:"]),
    4,
  );
