import type { DependencyEntry } from "#scripts/outdatedDependencies/models/DependencyEntry";
import type { OutdatedDependency } from "#scripts/outdatedDependencies/models/OutdatedDependency";
import type { RegistryCheckError } from "#scripts/outdatedDependencies/models/RegistryCheckError";

import { REGISTRY_CONCURRENCY } from "#scripts/outdatedDependencies/constants";
import { getSpecifierBase } from "#scripts/outdatedDependencies/getSpecifierBase";
import { getVersionChangeLevel } from "#scripts/outdatedDependencies/getVersionChangeLevel";
import { isVersionOutdated } from "#scripts/outdatedDependencies/isVersionOutdated";
import { getLatestVersion } from "#scripts/services/getLatestVersion";
import { getResultAsync } from "@esposter/shared";

const GroupMetadataMap: Record<string, { dependencyType: string; dependent: string }> = {
  configDependencies: { dependencyType: "config", dependent: "configDependencies" },
  engines: { dependencyType: "engine", dependent: "engines" },
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
          if (isVersionOutdated(current, latest))
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
