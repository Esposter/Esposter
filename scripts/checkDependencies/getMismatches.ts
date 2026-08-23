import type { DependencyEntry } from "#scripts/checkDependencies/models/DependencyEntry";
import type { Mismatch } from "#scripts/checkDependencies/models/Mismatch";

import { getSpecifierBase } from "#scripts/checkDependencies/getSpecifierBase";

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
