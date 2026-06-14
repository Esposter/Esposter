import { parseLockResolvedVersions } from "@/checkDependencies/parseLockResolvedVersions";
import { sliceLockSection } from "@/checkDependencies/sliceLockSection";

export const getLockConfigDependencyVersions = (lockYaml: string): Map<string, string> =>
  parseLockResolvedVersions(sliceLockSection(lockYaml, "\nimporters:", ["\npackages:"]), 6);
