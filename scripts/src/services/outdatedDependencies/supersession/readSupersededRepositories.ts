import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";
import type { RegistryCheckError } from "#src/models/outdatedDependencies/shared/RegistryCheckError";
import type { SupersededRepository } from "#src/models/outdatedDependencies/shared/SupersededRepository";
import type { PackumentRepository } from "#src/models/shared/PackumentRepository";

import { getRegistryPackageName } from "#src/services/outdatedDependencies/getRegistryPackageName";
import { REGISTRY_CONCURRENCY } from "#src/services/outdatedDependencies/registry/constants";
import { getGithubRepository } from "#src/services/outdatedDependencies/supersession/getGithubRepository";
import { readPackageName } from "#src/services/outdatedDependencies/supersession/readPackageName";
import { readRepositoryState } from "#src/services/outdatedDependencies/supersession/readRepositoryState";
import { fetchRegistry } from "#src/services/shared/fetchRegistry";
import { getResultAsync } from "@esposter/shared";

const readPackageSupersession = async (packageName: string): Promise<SupersededRepository | undefined> => {
  const { repository } = await fetchRegistry<PackumentRepository>(packageName, "/latest");
  const githubRepository = getGithubRepository(repository?.url ?? "");
  if (!githubRepository) return undefined;

  const { fullName, isArchived } = await readRepositoryState(githubRepository);
  const isRenamed = fullName.toLowerCase() !== githubRepository.toLowerCase();
  if (!isRenamed && !isArchived) return undefined;

  return {
    isArchived,
    packageName,
    renamedTo: isRenamed ? fullName : "",
    repository: githubRepository,
    successor: isRenamed ? await readPackageName(fullName, repository?.directory ?? "") : "",
  };
};

// Each direct catalog package's npm repository, asked of GitHub: a repository it renamed, or archived, is reported with
// The package its renamed repository now declares. A failed request is an error, never a repository read as current.
export const readSupersededRepositories = async (
  entries: DependencyEntry[],
): Promise<{ errors: RegistryCheckError[]; repositories: SupersededRepository[] }> => {
  const errors: RegistryCheckError[] = [];
  const repositories: SupersededRepository[] = [];
  const packageNames = [...new Set(entries.map((entry) => getRegistryPackageName(entry)))];

  // Batches of the registry's own bound, since an unbounded burst of requests times out most of them
  for (let index = 0; index < packageNames.length; index += REGISTRY_CONCURRENCY) {
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: each batch settles before the next one starts
    await Promise.all(
      packageNames.slice(index, index + REGISTRY_CONCURRENCY).map((packageName) =>
        getResultAsync(() => readPackageSupersession(packageName)).match(
          (repository) => {
            if (repository) repositories.push(repository);
          },
          (error) => {
            errors.push({ error: error.message, packageName });
          },
        ),
      ),
    );
  }

  return { errors, repositories };
};
