import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";
import type { Mismatch } from "#src/models/outdatedDependencies/shared/Mismatch";

import { getSpecifierBase } from "#src/services/outdatedDependencies/getSpecifierBase";

export const getMismatches = (entries: DependencyEntry[], resolvedVersions: Map<string, string>): Mismatch[] => {
  const mismatches: Mismatch[] = [];

  for (const { group, packageName, specifier } of entries) {
    const resolved = resolvedVersions.get(packageName);
    if (!resolved) continue;

    const specifierBase = getSpecifierBase(specifier);
    if (specifierBase !== resolved) mismatches.push({ group, packageName, resolved, specifier });
  }

  return mismatches;
};
