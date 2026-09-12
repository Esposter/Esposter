import { parseLockResolvedVersions } from "#src/services/outdatedDependencies/lock/parseLockResolvedVersions";
import { sliceLockSection } from "#src/services/outdatedDependencies/lock/sliceLockSection";

export const getLockConfigDependencyVersions = (lockYaml: string): Map<string, string> =>
  parseLockResolvedVersions(sliceLockSection(lockYaml, "\nimporters:", ["\npackages:"]), 6);
