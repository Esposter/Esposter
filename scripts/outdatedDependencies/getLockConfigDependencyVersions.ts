import { parseLockResolvedVersions } from "#scripts/outdatedDependencies/parseLockResolvedVersions";
import { sliceLockSection } from "#scripts/outdatedDependencies/sliceLockSection";

export const getLockConfigDependencyVersions = (lockYaml: string): Map<string, string> =>
  parseLockResolvedVersions(sliceLockSection(lockYaml, "\nimporters:", ["\npackages:"]), 6);
