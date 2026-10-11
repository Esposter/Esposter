import type { RepositoriesResponse } from "#src/models/outdatedDependencies/shared/RepositoriesResponse";
import type { RepositoryReadResult } from "#src/models/outdatedDependencies/shared/RepositoryReadResult";

import { getRepositoryAlias } from "#src/services/outdatedDependencies/supersession/getRepositoryAlias";

// Each repository's read from the response to `buildRepositoriesQuery`, a field GitHub could not resolve read as its error
export const parseRepositoryReads = (
  response: RepositoriesResponse,
  repositories: string[],
): Map<string, RepositoryReadResult> => {
  const messages = new Map((response.errors ?? []).map(({ message, path = [] }) => [String(path[0]), message]));

  return new Map(
    repositories.map((repository, index): [string, RepositoryReadResult] => {
      const alias = getRepositoryAlias(index);
      const node = response.data?.[alias];
      if (node) return [repository, { fullName: node.nameWithOwner, isArchived: node.isArchived }];

      return [repository, { error: messages.get(alias) ?? "GitHub returned no repository" }];
    }),
  );
};
