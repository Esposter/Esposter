import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";
import type { OutdatedDependency } from "#src/models/outdatedDependencies/shared/OutdatedDependency";
import type { OutdatedDependencyCheck } from "#src/models/outdatedDependencies/shared/OutdatedDependencyCheck";
import type { RegistryCheckError } from "#src/models/outdatedDependencies/shared/RegistryCheckError";

import { getSpecifierBase } from "#src/services/outdatedDependencies/getSpecifierBase";
import { getVersionChangeLevel } from "#src/services/outdatedDependencies/getVersionChangeLevel";
import { checkIsVersionOutdated } from "#src/services/outdatedDependencies/registry/checkIsVersionOutdated";
import { REGISTRY_CONCURRENCY } from "#src/services/outdatedDependencies/registry/constants";
import { GroupMetadataMap } from "#src/services/outdatedDependencies/registry/GroupMetadataMap";
import { getResultAsync } from "@esposter/shared";

const DIGEST_DEPENDENCY_TYPE = "digest";
// A digest's first seven hex characters, as git abbreviates a commit, which tell two digests apart in a table
const getShortDigest = (digest: string): string => digest.replace(/^sha256:/u, "").slice(0, 7);

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
  // A shared cursor rather than a queue shifted from the front: every worker takes the next index, and nothing
  // Is copied
  let nextIndex = 0;

  const workers = Array.from({ length: concurrency }, async () => {
    for (;;) {
      const entry = entries[nextIndex];
      if (!entry) return;
      nextIndex += 1;

      const { dependent: entryDependent, digest, followTag, group, packageName, resolved, specifier } = entry;
      const { dependencyType, dependent, readRelease } = GroupMetadataMap[group];
      // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: each pool worker takes the next package only after its request settles
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
