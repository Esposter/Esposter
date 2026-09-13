import type { DependencyEntry } from "#src/models/outdatedDependencies/DependencyEntry";
import type { OutdatedDependency } from "#src/models/outdatedDependencies/OutdatedDependency";
import type { OutdatedDependencyCheck } from "#src/models/outdatedDependencies/OutdatedDependencyCheck";
import type { RegistryCheckError } from "#src/models/outdatedDependencies/RegistryCheckError";

import { getSpecifierBase } from "#src/services/outdatedDependencies/getSpecifierBase";
import { getVersionChangeLevel } from "#src/services/outdatedDependencies/getVersionChangeLevel";
import { checkIsVersionOutdated } from "#src/services/outdatedDependencies/registry/checkIsVersionOutdated";
import { REGISTRY_CONCURRENCY } from "#src/services/outdatedDependencies/registry/constants";
import { GroupMetadataMap } from "#src/services/outdatedDependencies/registry/GroupMetadataMap";
import { getLatestVersion } from "#src/services/shared/getLatestVersion";
import { getResultAsync } from "@esposter/shared";

export const getRegistryOutdatedDependencies = async (entries: DependencyEntry[]): Promise<OutdatedDependencyCheck> => {
  // Keyed by the entry object itself, because a package name is not an identity: two manifests declaring the
  // Same engine under different constraints are two entries, and so is a package that is both a config
  // Dependency and an engine. Keyed by name, the last result written wins and is then emitted once per entry
  // That shares the name — a duplicated row carrying another entry's specifier. The ordering loop below walks
  // The very array the workers took their entries from, so identity is exact and needs no composite key.
  const outdatedDependencyMap = new Map<DependencyEntry, OutdatedDependency>();
  const errors: RegistryCheckError[] = [];
  // A shared cursor rather than a queue shifted from the front: every worker takes the next index, and nothing
  // Is copied
  let nextIndex = 0;

  const workers = Array.from({ length: REGISTRY_CONCURRENCY }, async () => {
    for (;;) {
      const entry = entries[nextIndex];
      if (!entry) return;
      nextIndex += 1;

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
  // Each level is read once here rather than once per comparison the sort makes, which parses both versions
  const outdatedDependencies = entries.flatMap((entry) => {
    const dependency = outdatedDependencyMap.get(entry);
    return dependency
      ? [{ changeLevel: getVersionChangeLevel(dependency.current, dependency.latest), dependency }]
      : [];
  });

  return {
    errors: errors.toSorted((left, right) => left.pkg.localeCompare(right.pkg)),
    outdatedDependencies: outdatedDependencies
      .toSorted(
        (left, right) =>
          left.changeLevel - right.changeLevel || left.dependency.pkg.localeCompare(right.dependency.pkg),
      )
      .map(({ dependency }) => dependency),
  };
};
