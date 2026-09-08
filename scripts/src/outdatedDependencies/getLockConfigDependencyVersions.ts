import { parseLockResolvedVersions } from "#src/outdatedDependencies/parseLockResolvedVersions";
import { sliceLockSection } from "#src/outdatedDependencies/sliceLockSection";

export const getLockConfigDependencyVersions = (lockYaml: string): Map<string, string> =>
  parseLockResolvedVersions(sliceLockSection(lockYaml, "\nimporters:", ["\npackages:"]), 6);
