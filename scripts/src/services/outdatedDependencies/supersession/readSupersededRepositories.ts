import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";
import type { PackageLookup } from "#src/models/outdatedDependencies/shared/PackageLookup";
import type { RegistryCheckError } from "#src/models/outdatedDependencies/shared/RegistryCheckError";
import type { SupersededRepository } from "#src/models/outdatedDependencies/shared/SupersededRepository";
import type { SupersessionCacheEntry } from "#src/models/outdatedDependencies/shared/SupersessionCacheEntry";
import type { PackumentRepository } from "#src/models/shared/PackumentRepository";

import { getRegistryPackageName } from "#src/services/outdatedDependencies/getRegistryPackageName";
import { getGithubRepository } from "#src/services/outdatedDependencies/supersession/getGithubRepository";
import { getSupersessionCacheKey } from "#src/services/outdatedDependencies/supersession/getSupersessionCacheKey";
import { partitionCachedLookups } from "#src/services/outdatedDependencies/supersession/partitionCachedLookups";
import { readInBatches } from "#src/services/outdatedDependencies/supersession/readInBatches";
import { readPackageName } from "#src/services/outdatedDependencies/supersession/readPackageName";
import { readRepositoryReads } from "#src/services/outdatedDependencies/supersession/readRepositoryReads";
import { readSupersessionCache } from "#src/services/outdatedDependencies/supersession/readSupersessionCache";
import { writeSupersessionCache } from "#src/services/outdatedDependencies/supersession/writeSupersessionCache";
import { fetchRegistry } from "#src/services/shared/fetchRegistry";

const readRepositoryUrl = async (packageName: string): Promise<string> => {
  const { repository } = await fetchRegistry<PackumentRepository>(packageName, "/latest");

  return getGithubRepository(repository?.url ?? "");
};

// Each direct catalog package's npm repository, asked of GitHub: a repository it renamed, or archived, is reported with
// The package its renamed repository now declares. A failed request is an error, never a repository read as current.
// A read is kept per locked version and for a bounded age, so only a package whose version moved, or whose read went
// Stale, is asked again.
export const readSupersededRepositories = async (
  entries: DependencyEntry[],
  lockCatalogVersions: Map<string, string>,
): Promise<{ errors: RegistryCheckError[]; repositories: SupersededRepository[] }> => {
  const packages = [
    ...new Map(
      entries.map((entry): [string, PackageLookup] => {
        const packageName = getRegistryPackageName(entry);
        const version = lockCatalogVersions.get(entry.packageName) ?? "";

        return [packageName, { cacheKey: getSupersessionCacheKey(packageName, version), packageName }];
      }),
    ).values(),
  ];
  const now = Temporal.Now.instant();
  const readAt = now.toString();
  const { cached: verdicts, uncached } = partitionCachedLookups(packages, readSupersessionCache(), now);

  const { errors, values: repositoryUrls } = await readInBatches(uncached, ({ packageName }) =>
    readRepositoryUrl(packageName),
  );
  for (const [lookup, url] of repositoryUrls)
    if (!url)
      verdicts.set(lookup, { readAt, verdict: { isArchived: false, renamedTo: "", repository: "", successor: "" } });

  const withRepository = [...repositoryUrls].filter(([, url]) => url);
  const reads = readRepositoryReads([...new Set(withRepository.map(([, url]) => url))]);
  const renamed: { fullName: string; lookup: PackageLookup }[] = [];
  for (const [lookup, url] of withRepository) {
    const read = reads.get(url);
    if (!read) continue;
    if ("error" in read) {
      errors.set(lookup, read.error);
      continue;
    }

    const isRenamed = read.fullName.toLowerCase() !== url.toLowerCase();
    verdicts.set(lookup, {
      readAt,
      verdict: {
        isArchived: read.isArchived,
        renamedTo: isRenamed ? read.fullName : "",
        repository: url,
        successor: "",
      },
    });
    if (isRenamed) renamed.push({ fullName: read.fullName, lookup });
  }

  const successors = await readInBatches(renamed, ({ fullName }) => readPackageName(fullName));
  for (const [{ lookup }, successor] of successors.values) {
    const entry = verdicts.get(lookup);
    if (entry) entry.verdict.successor = successor;
  }
  for (const [{ lookup }, error] of successors.errors) {
    errors.set(lookup, error);
    verdicts.delete(lookup);
  }

  // Written for every package the run read, so a version no longer in the catalog drops out of the cache
  writeSupersessionCache(
    Object.fromEntries(
      packages.flatMap((lookup): [string, SupersessionCacheEntry][] => {
        const entry = verdicts.get(lookup);

        return entry && !errors.has(lookup) ? [[lookup.cacheKey, entry]] : [];
      }),
    ),
  );

  return {
    errors: packages.flatMap((lookup) => {
      const error = errors.get(lookup);

      return error === undefined ? [] : [{ error, packageName: lookup.packageName }];
    }),
    repositories: packages.flatMap((lookup) => {
      const entry = verdicts.get(lookup);

      return entry && (entry.verdict.renamedTo || entry.verdict.isArchived)
        ? [{ packageName: lookup.packageName, ...entry.verdict }]
        : [];
    }),
  };
};
