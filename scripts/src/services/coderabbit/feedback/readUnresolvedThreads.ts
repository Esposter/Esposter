import type { ReviewThreadsPage } from "#src/models/coderabbit/feedback/ReviewThreadsPage";
import type { ReviewThread } from "#src/models/coderabbit/shared/ReviewThread";

import { CODERABBIT_GRAPHQL_LOGIN } from "#src/services/coderabbit/shared/constants";
import { readRepository } from "#src/services/coderabbit/shared/readRepository";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

// `$endCursor` and `pageInfo` are both load-bearing: `gh` follows the cursor only when the query declares one
// And selects the other, and without them it returns the first page and exits 0. A long-lived pull request
// Accumulates threads for its whole life, so that drops the newest page exactly when the backlog matters.
// The first comment is the finding and the rest are its answers: the last one's author says whether an answer came
// And its body what it was, and every author after the finding whether the collector has answered it at all. A
// Thread runs to a handful of comments, far inside one page of them.
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
          comments(first: 100) { nodes { databaseId author { login } body } }
        }
      }
    }
  }
}`;

export const readUnresolvedThreads = (pullRequest: number): ReviewThread[] => {
  const { name, owner } = readRepository();
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
    .flatMap(({ comments, line, path }) => {
      const [finding, ...replies] = comments.nodes;
      if (finding?.author?.login !== CODERABBIT_GRAPHQL_LOGIN) return [];

      const lastNode = replies.at(-1) ?? finding;
      return [
        {
          body: finding.body,
          commentId: finding.databaseId,
          lastAuthorLogin: lastNode.author?.login ?? "",
          lastBody: lastNode.body,
          line: line ?? undefined,
          path,
          replyAuthorLogins: replies.map(({ author }) => author?.login ?? ""),
        },
      ];
    });
};
