import type { RenovateRule } from "#src/models/outdatedDependencies/renovate/RenovateRule";
import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";
import type { HeldDependency } from "#src/models/outdatedDependencies/shared/HeldDependency";
import type { OutdatedDependencyCheck } from "#src/models/outdatedDependencies/shared/OutdatedDependencyCheck";
import type { RegistryCheckError } from "#src/models/shared/RegistryCheckError";
import type { Packument } from "#src/models/updateNode/Packument";

import { getHoldingRule } from "#src/services/outdatedDependencies/renovate/getHoldingRule";
import { getWithinRangeBump } from "#src/services/outdatedDependencies/renovate/getWithinRangeBump";
import { fetchRegistry } from "#src/services/shared/fetchRegistry";
import { getResultAsync } from "@esposter/shared";

// Only a cap on a catalog package has a line to bump within, so only those are read from the registry, all at once.
// A disabled package is skipped without a read.
export const readWithinRangeBumps = async (
  held: HeldDependency[],
  catalogEntries: DependencyEntry[],
  rules: RenovateRule[],
): Promise<OutdatedDependencyCheck> => {
  const specifierMap = new Map(catalogEntries.map(({ packageName, specifier }) => [packageName, specifier]));
  const errors: RegistryCheckError[] = [];
  const candidates = held.flatMap(({ dependency }) => {
    const rule = getHoldingRule(dependency, rules);
    const specifier = specifierMap.get(dependency.packageName);
    return rule?.enabled !== false && rule?.allowedVersions !== undefined && specifier !== undefined
      ? [{ dependency, rule, specifier }]
      : [];
  });

  const outdatedDependencies = await Promise.all(
    candidates.map(({ dependency, rule, specifier }) =>
      getResultAsync(() => fetchRegistry<Packument>(dependency.packageName)).match(
        ({ versions }) => getWithinRangeBump(dependency, specifier, rule, Object.keys(versions)),
        (error) => {
          errors.push({ error: error.message, packageName: dependency.packageName });
          return undefined;
        },
      ),
    ),
  );

  return { errors, outdatedDependencies: outdatedDependencies.filter((dependency) => dependency !== undefined) };
};
