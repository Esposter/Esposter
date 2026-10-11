import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";
import type { RegistryCheckError } from "#src/models/outdatedDependencies/shared/RegistryCheckError";
import type { SupersededRepository } from "#src/models/outdatedDependencies/shared/SupersededRepository";
import type { SupersessionVerdict } from "#src/models/outdatedDependencies/shared/SupersessionVerdict";
import type { PackumentRepository } from "#src/models/shared/PackumentRepository";

import { getRegistryPackageName } from "#src/services/outdatedDependencies/getRegistryPackageName";
import { getGithubRepository } from "#src/services/outdatedDependencies/supersession/getGithubRepository";
import { getSupersessionCacheKey } from "#src/services/outdatedDependencies/supersession/getSupersessionCacheKey";
import { readInBatches } from "#src/services/outdatedDependencies/supersession/readInBatches";
import { readPackageName } from "#src/services/outdatedDependencies/supersession/readPackageName";
import { readRepositoryReads } from "#src/services/outdatedDependencies/supersession/readRepositoryReads";
import { readSupersessionCache } from "#src/services/outdatedDependencies/supersession/readSupersessionCache";
import { writeSupersessionCache } from "#src/services/outdatedDependencies/supersession/writeSupersessionCache";
import { fetchRegistry } from "#src/services/shared/fetchRegistry";

// A package the report asks about, with the key its verdict is cached under
interface PackageLookup {
  cacheKey: string;
  packageName: string;
}

// Where a package's npm metadata names its GitHub repository, and the directory of the monorepo the package lives in
interface PackageRepository {
  directory: string;
  url: string;
}

const readPackageRepository = async (packageName: string): Promise<PackageRepository> => {
  const { repository } = await fetchRegistry<PackumentRepository>(packageName, "/latest");

  return { directory: repository?.directory ?? "", url: getGithubRepository(repository?.url ?? "") };
};

// Each direct catalog package's npm repository, asked of GitHub: a repository it renamed, or archived, is reported with
// The package its renamed repository now declares. A failed request is an error, never a repository read as current, and
// A verdict is kept per locked version, so only a package whose version moved is asked again.
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
  const cache = readSupersessionCache();
  const verdicts = new Map<PackageLookup, SupersessionVerdict>();
  const uncached: PackageLookup[] = [];
  for (const lookup of packages) {
    const cached = cache[lookup.cacheKey];
    if (cached) verdicts.set(lookup, cached);
    else uncached.push(lookup);
  }

  const { errors, values: packageRepositories } = await readInBatches(uncached, ({ packageName }) =>
    readPackageRepository(packageName),
  );
  for (const [lookup, { url }] of packageRepositories)
    if (!url) verdicts.set(lookup, { isArchived: false, renamedTo: "", repository: "", successor: "" });

  const withRepository = [...packageRepositories].filter(([, { url }]) => url);
  const reads = readRepositoryReads([...new Set(withRepository.map(([, { url }]) => url))]);
  const renamed: { directory: string; fullName: string; lookup: PackageLookup }[] = [];
  for (const [lookup, { directory, url }] of withRepository) {
    const read = reads.get(url);
    if (!read) continue;
    if ("error" in read) {
      errors.set(lookup, read.error);
      continue;
    }

    const isRenamed = read.fullName.toLowerCase() !== url.toLowerCase();
    verdicts.set(lookup, {
      isArchived: read.isArchived,
      renamedTo: isRenamed ? read.fullName : "",
      repository: url,
      successor: "",
    });
    if (isRenamed) renamed.push({ directory, fullName: read.fullName, lookup });
  }

  const successors = await readInBatches(renamed, ({ directory, fullName }) => readPackageName(fullName, directory));
  for (const [{ lookup }, successor] of successors.values) {
    const verdict = verdicts.get(lookup);
    if (verdict) verdict.successor = successor;
  }
  for (const [{ lookup }, error] of successors.errors) {
    errors.set(lookup, error);
    verdicts.delete(lookup);
  }

  // Written for every package the run read, so a version no longer in the catalog drops out of the cache
  writeSupersessionCache(
    Object.fromEntries(
      packages.flatMap((lookup) => {
        const verdict = verdicts.get(lookup);

        return verdict && !errors.has(lookup) ? [[lookup.cacheKey, verdict] as const] : [];
      }),
    ),
  );

  return {
    errors: packages.flatMap((lookup) => {
      const error = errors.get(lookup);

      return error === undefined ? [] : [{ error, packageName: lookup.packageName }];
    }),
    repositories: packages.flatMap((lookup) => {
      const verdict = verdicts.get(lookup);

      return verdict && (verdict.renamedTo || verdict.isArchived)
        ? [{ packageName: lookup.packageName, ...verdict }]
        : [];
    }),
  };
};
