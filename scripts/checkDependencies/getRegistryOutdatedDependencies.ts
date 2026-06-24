import type { DependencyEntry } from "@/checkDependencies/models/DependencyEntry";
import type { OutdatedDependency } from "@/checkDependencies/models/OutdatedDependency";
import type { RegistryCheckError } from "@/checkDependencies/models/RegistryCheckError";

import { getLatestVersion } from "@/checkDependencies/getLatestVersion";
import { getSpecifierBase } from "@/checkDependencies/getSpecifierBase";
import { getVersionChangeLevel } from "@/checkDependencies/getVersionChangeLevel";
import { isVersionOutdated } from "@/checkDependencies/isVersionOutdated";
import { getResultAsync } from "@esposter/shared";

const registryConcurrency = 4;
const groupMetadata: Record<string, { dependencyType: string; dependent: string }> = {
  configDependencies: { dependencyType: "config", dependent: "configDependencies" },
  engines: { dependencyType: "engine", dependent: "engines" },
};

export const getRegistryOutdatedDependencies = async (
  entries: DependencyEntry[],
): Promise<{ errors: RegistryCheckError[]; outdatedDependencies: OutdatedDependency[] }> => {
  const outdatedDependencies: OutdatedDependency[] = [];
  const errors: RegistryCheckError[] = [];
  const queue = [...entries];

  const workers = Array.from({ length: registryConcurrency }, async () => {
    for (;;) {
      const entry = queue.shift();
      if (!entry) return;

      const { group, pkg, specifier } = entry;
      await getResultAsync(() => getLatestVersion(pkg)).match(
        (latest) => {
          const current = getSpecifierBase(specifier);
          const metadata = groupMetadata[group];
          if (isVersionOutdated(current, latest))
            outdatedDependencies.push({
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
  const outdatedDependencyMap = new Map(outdatedDependencies.map((dependency) => [dependency.pkg, dependency]));
  const orderedOutdatedDependencies: OutdatedDependency[] = [];
  for (const { pkg } of entries) {
    const dependency = outdatedDependencyMap.get(pkg);
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
