import type { ReviewThreadsPage } from "#src/coderabbit/models/feedback/ReviewThreadsPage";
import type { ReviewThread } from "#src/coderabbit/models/ReviewThread";

import { CODERABBIT_GRAPHQL_LOGIN } from "#src/coderabbit/constants";
import { getRepository } from "#src/coderabbit/services/getRepository";
import { runGh } from "#src/coderabbit/services/runGh";
import { parseMachineJson } from "#src/services/parseMachineJson";

// `$endCursor` and `pageInfo` are both load-bearing: `gh` follows the cursor only when the query declares one
// And selects the other, and without them it returns the first page and exits 0. A long-lived pull request
// Accumulates threads for its whole life, so that drops the newest page exactly when the backlog matters.
const QUERY = `
query($owner: String!, $name: String!, $pullRequest: Int!, $endCursor: String) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $pullRequest) {
      reviewThreads(first: 100, after: $endCursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          isResolved
          path
          line
          comments(first: 1) { nodes { databaseId author { login } body } }
        }
      }
    }
  }
}`;

export const readUnresolvedThreads = (pullRequest: number): ReviewThread[] => {
  const { name, owner } = getRepository();
  return parseMachineJson<ReviewThreadsPage[]>(
    runGh([
      "api",
      "graphql",
      "--paginate",
      "--slurp",
      "-f",
      `owner=${owner.login}`,
      "-f",
      `name=${name}`,
      "-F",
      `pullRequest=${pullRequest.toString()}`,
      "-f",
      `query=${QUERY}`,
    ]),
  )
    .flatMap(({ data }) => data.repository.pullRequest.reviewThreads.nodes)
    .filter(({ isResolved }) => !isResolved)
    .flatMap(({ comments, line, path }) =>
      comments.nodes
        .filter(({ author }) => author.login === CODERABBIT_GRAPHQL_LOGIN)
        .map(({ body, databaseId }) => ({ body, commentId: databaseId, line: line ?? undefined, path })),
    );
};
