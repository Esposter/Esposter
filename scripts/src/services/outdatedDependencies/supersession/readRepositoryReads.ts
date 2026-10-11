import type { RepositoriesResponse } from "#src/models/outdatedDependencies/shared/RepositoriesResponse";
import type { RepositoryReadResult } from "#src/models/outdatedDependencies/shared/RepositoryReadResult";

import { GITHUB_GRAPHQL_BATCH_SIZE } from "#src/services/outdatedDependencies/supersession/constants";
import { buildRepositoriesQuery } from "#src/services/outdatedDependencies/supersession/buildRepositoriesQuery";
import { parseRepositoryReads } from "#src/services/outdatedDependencies/supersession/parseRepositoryReads";
import { MAX_BUFFER_BYTES } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "node:child_process";

const runGraphql = (query: string): RepositoriesResponse => {
  const { error, stderr, stdout } = spawnSync("gh", ["api", "graphql", "-f", `query=${query}`], {
    encoding: "utf8",
    maxBuffer: MAX_BUFFER_BYTES,
  });
  // `gh` exits 1 on a GraphQL error yet still prints the response, which names each field it could not resolve
  if (stdout) return parseMachineJson<RepositoriesResponse>(stdout);

  throw new InvalidOperationError(
    Operation.Read,
    runGraphql.name,
    stderr.trim() || error?.message || "gh api graphql printed no response",
  );
};

// Every repository's state, one GraphQL request per batch. A batch whose request fails fails each repository in it,
// Which the caller reports as an error rather than reading as a repository that is current.
export const readRepositoryReads = (repositories: string[]): Map<string, RepositoryReadResult> => {
  const reads = new Map<string, RepositoryReadResult>();

  for (let index = 0; index < repositories.length; index += GITHUB_GRAPHQL_BATCH_SIZE) {
    const batch = repositories.slice(index, index + GITHUB_GRAPHQL_BATCH_SIZE);

    getResult(() => parseRepositoryReads(runGraphql(buildRepositoriesQuery(batch)), batch)).match(
      (batchReads) => {
        for (const [repository, read] of batchReads) reads.set(repository, read);
      },
      ({ message }) => {
        for (const repository of batch) reads.set(repository, { error: message });
      },
    );
  }

  return reads;
};
