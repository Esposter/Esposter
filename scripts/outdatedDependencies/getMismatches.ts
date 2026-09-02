import type { DependencyEntry } from "#scripts/outdatedDependencies/models/DependencyEntry";
import type { Mismatch } from "#scripts/outdatedDependencies/models/Mismatch";

import { getSpecifierBase } from "#scripts/outdatedDependencies/getSpecifierBase";

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
