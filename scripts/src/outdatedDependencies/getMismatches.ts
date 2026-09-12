import type { DependencyEntry } from "#src/models/outdatedDependencies/DependencyEntry";
import type { Mismatch } from "#src/models/outdatedDependencies/Mismatch";

import { getSpecifierBase } from "#src/outdatedDependencies/getSpecifierBase";

export const getMismatches = (entries: DependencyEntry[], resolvedVersions: Map<string, string>): Mismatch[] => {
  const mismatches: Mismatch[] = [];

  for (const { group, pkg, specifier } of entries) {
    const resolved = resolvedVersions.get(pkg);
    if (!resolved) continue;

    const specifierBase = getSpecifierBase(specifier);
    if (specifierBase !== resolved) mismatches.push({ group, pkg, resolved, specifier });
  }

  return mismatches;
};
