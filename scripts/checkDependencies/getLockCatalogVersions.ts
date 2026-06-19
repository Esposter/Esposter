import { parseLockResolvedVersions } from "@/checkDependencies/parseLockResolvedVersions";
import { sliceLockSection } from "@/checkDependencies/sliceLockSection";

export const getLockCatalogVersions = (lockYaml: string): Map<string, string> =>
  parseLockResolvedVersions(
    sliceLockSection(lockYaml, "\ncatalogs:", ["\npackages:", "\nsnapshots:", "\nimporters:"]),
    4,
  );
