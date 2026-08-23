import { parseLockResolvedVersions } from "#scripts/checkDependencies/parseLockResolvedVersions";
import { sliceLockSection } from "#scripts/checkDependencies/sliceLockSection";

export const getLockConfigDependencyVersions = (lockYaml: string): Map<string, string> =>
  parseLockResolvedVersions(sliceLockSection(lockYaml, "\nimporters:", ["\npackages:"]), 6);
