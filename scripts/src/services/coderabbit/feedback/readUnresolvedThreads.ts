import type { ReviewThreadsPage } from "#src/models/coderabbit/feedback/ReviewThreadsPage";
import type { ReviewThread } from "#src/models/coderabbit/shared/ReviewThread";

import { CODERABBIT_GRAPHQL_LOGIN } from "#src/services/coderabbit/shared/constants";
import { getRepository } from "#src/services/coderabbit/shared/getRepository";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

// `$endCursor` and `pageInfo` are both load-bearing: `gh` follows the cursor only when the query declares one
// And selects the other, and without them it returns the first page and exits 0. A long-lived pull request
// Accumulates threads for its whole life, so that drops the newest page exactly when the backlog matters.
// The first comment is the finding, and the last one is whether anyone has answered it since — its author says
// Whether the answer came, its body says what the answer was.
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
          firstComment: comments(first: 1) { nodes { databaseId author { login } body } }
          lastComment: comments(last: 1) { nodes { author { login } body } }
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
      `pullRequest=${pullRequest}`,
      "-f",
      `query=${QUERY}`,
    ]),
  )
    .flatMap(({ data }) => data.repository.pullRequest.reviewThreads.nodes)
    .filter(({ isResolved }) => !isResolved)
    .flatMap(({ firstComment, lastComment, line, path }) => {
      const lastNode = lastComment.nodes.at(-1);
      return firstComment.nodes
        .filter(({ author }) => author?.login === CODERABBIT_GRAPHQL_LOGIN)
        .map(({ body, databaseId }) => ({
          body,
          commentId: databaseId,
          lastAuthorLogin: lastNode?.author?.login ?? "",
          lastBody: lastNode?.body ?? "",
          line: line ?? undefined,
          path,
        }));
    });
};
