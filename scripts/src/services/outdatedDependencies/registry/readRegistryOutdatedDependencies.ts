import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";
import type { OutdatedDependency } from "#src/models/outdatedDependencies/shared/OutdatedDependency";
import type { OutdatedDependencyCheck } from "#src/models/outdatedDependencies/shared/OutdatedDependencyCheck";
import type { RegistryCheckError } from "#src/models/shared/RegistryCheckError";

import { getSpecifierBase } from "#src/services/outdatedDependencies/getSpecifierBase";
import { getVersionChangeLevel } from "#src/services/outdatedDependencies/getVersionChangeLevel";
import { checkIsVersionOutdated } from "#src/services/outdatedDependencies/registry/checkIsVersionOutdated";
import { DIGEST_DEPENDENCY_TYPE, REGISTRY_CONCURRENCY } from "#src/services/outdatedDependencies/registry/constants";
import { getShortDigest } from "#src/services/outdatedDependencies/registry/getShortDigest";
import { GroupMetadataMap } from "#src/services/outdatedDependencies/registry/GroupMetadataMap";
import { forEachConcurrently } from "#src/services/shared/forEachConcurrently";
import { getResultAsync } from "@esposter/shared";

// `concurrency` bounds how many requests one source sees at once: the npm registry's default, or every entry at once
// For a caller whose entries are each a different repository or image
export const readRegistryOutdatedDependencies = async (
  entries: DependencyEntry[],
  concurrency: number = REGISTRY_CONCURRENCY,
): Promise<OutdatedDependencyCheck> => {
  // Keyed by the entry object itself, because a package name is not an identity: two manifests declaring the
  // Same engine under different constraints are two entries, and so is a package that is both a config
  // Dependency and an engine. Keyed by name, the last result written wins and is then emitted once per entry
  // That shares the name — a duplicated row carrying another entry's version. The ordering loop below walks
  // The very array the workers took their entries from, so identity is exact and needs no composite key.
  const outdatedDependencyMap = new Map<DependencyEntry, OutdatedDependency>();
  const errors: RegistryCheckError[] = [];

  await forEachConcurrently(entries, concurrency, async (entry) => {
    const { dependent: entryDependent, digest, followTag, group, packageName, resolved, specifier } = entry;
    const { dependencyType, dependent, readRelease } = GroupMetadataMap[group];
    await getResultAsync(() => readRelease(entry)).match(
      ({ digest: latestDigest, version: latest }) => {
        const current = resolved ?? getSpecifierBase(specifier);
        const dependents = [entryDependent ?? dependent];
        if (checkIsVersionOutdated(current, latest))
          outdatedDependencyMap.set(entry, {
            current,
            // A followed tag is what the Latest column then holds, so the tag is the label
            dependencyType: followTag ?? dependencyType,
            dependents,
            latest,
            packageName,
          });
        // The version is current and the source has moved what it points at — a rebuilt image, a re-pointed tag
        else if (digest && latestDigest && digest !== latestDigest)
          outdatedDependencyMap.set(entry, {
            current: `${current}@${getShortDigest(digest)}`,
            dependencyType: DIGEST_DEPENDENCY_TYPE,
            dependents,
            latest: `${current}@${getShortDigest(latestDigest)}`,
            packageName,
          });
      },
      (error) => {
        errors.push({ error: error.message, packageName });
      },
    );
  });

  // Each level is read once here rather than once per comparison the sort makes, which parses both versions
  const outdatedDependencies = entries.flatMap((entry) => {
    const dependency = outdatedDependencyMap.get(entry);
    return dependency
      ? [{ changeLevel: getVersionChangeLevel(dependency.current, dependency.latest), dependency }]
      : [];
  });

  return {
    errors: errors.toSorted((left, right) => left.packageName.localeCompare(right.packageName)),
    outdatedDependencies: outdatedDependencies
      .toSorted(
        (left, right) =>
          left.changeLevel - right.changeLevel ||
          left.dependency.packageName.localeCompare(right.dependency.packageName),
      )
      .map(({ dependency }) => dependency),
  };
};
