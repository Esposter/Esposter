import type { DependencyEntry } from "#src/models/outdatedDependencies/DependencyEntry";
import type { OutdatedDependency } from "#src/models/outdatedDependencies/OutdatedDependency";
import type { RegistryCheckError } from "#src/models/outdatedDependencies/RegistryCheckError";

import { DependencyGroup } from "#src/models/outdatedDependencies/DependencyGroup";
import { checkIsVersionOutdated } from "#src/outdatedDependencies/checkIsVersionOutdated";
import { REGISTRY_CONCURRENCY } from "#src/outdatedDependencies/constants";
import { getSpecifierBase } from "#src/outdatedDependencies/getSpecifierBase";
import { getVersionChangeLevel } from "#src/outdatedDependencies/getVersionChangeLevel";
import { getLatestVersion } from "#src/services/getLatestVersion";
import { getResultAsync } from "@esposter/shared";

const GroupMetadataMap: Partial<Record<DependencyGroup, { dependencyType: string; dependent: string }>> = {
  [DependencyGroup.ConfigDependencies]: { dependencyType: "config", dependent: DependencyGroup.ConfigDependencies },
  [DependencyGroup.Engines]: { dependencyType: "engine", dependent: DependencyGroup.Engines },
};

export const getRegistryOutdatedDependencies = async (
  entries: DependencyEntry[],
): Promise<{ errors: RegistryCheckError[]; outdatedDependencies: OutdatedDependency[] }> => {
  // Keyed by the entry object itself, because a package name is not an identity: two manifests declaring the
  // Same engine under different constraints are two entries, and so is a package that is both a config
  // Dependency and an engine. Keyed by name, the last result written wins and is then emitted once per entry
  // That shares the name — a duplicated row carrying another entry's specifier. The ordering loop below walks
  // The very array the workers took their entries from, so identity is exact and needs no composite key.
  const outdatedDependencyMap = new Map<DependencyEntry, OutdatedDependency>();
  const errors: RegistryCheckError[] = [];
  const queue = [...entries];

  const workers = Array.from({ length: REGISTRY_CONCURRENCY }, async () => {
    for (;;) {
      const entry = queue.shift();
      if (!entry) return;

      const { group, pkg, specifier } = entry;
      await getResultAsync(() => getLatestVersion(pkg)).match(
        (latest) => {
          const current = getSpecifierBase(specifier);
          const metadata = GroupMetadataMap[group];
          if (checkIsVersionOutdated(current, latest))
            outdatedDependencyMap.set(entry, {
              current,
              dependencyType: metadata?.dependencyType ?? "",
              dependents: metadata ? [metadata.dependent] : [],
              latest,
              pkg,
              specifier,
            });
        },
        (error) => {
          errors.push({ error: error.message, pkg });
        },
      );
    }
  });

  await Promise.all(workers);
  const orderedOutdatedDependencies: OutdatedDependency[] = [];
  for (const entry of entries) {
    const dependency = outdatedDependencyMap.get(entry);
    if (dependency) orderedOutdatedDependencies.push(dependency);
  }

  return {
    errors: errors.toSorted((left, right) => left.pkg.localeCompare(right.pkg)),
    outdatedDependencies: orderedOutdatedDependencies.toSorted((left, right) => {
      const changeLevelDifference =
        getVersionChangeLevel(left.current, left.latest) - getVersionChangeLevel(right.current, right.latest);
      if (changeLevelDifference !== 0) return changeLevelDifference;

      return left.pkg.localeCompare(right.pkg);
    }),
  };
};
