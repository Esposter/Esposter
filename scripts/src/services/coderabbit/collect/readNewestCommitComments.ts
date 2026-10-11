import type { CommitCommentsPage } from "#src/models/coderabbit/collect/CommitCommentsPage";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { readRepository } from "#src/services/coderabbit/shared/readRepository";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

// `gh --paginate` follows only `endCursor` forward, so the newest pages are walked back by hand through `startCursor`
const QUERY = `
query($owner: String!, $name: String!, $startCursor: String) {
  repository(owner: $owner, name: $name) {
    commitComments(last: 100, before: $startCursor) {
      pageInfo { hasPreviousPage startCursor }
      nodes { author { login } body createdAt databaseId }
    }
  }
}`;
// Every commit's comments at once, newest first by page, for a count whose attempts are posted on whichever commit was
// At hand and must be read whatever commit is at hand now: a red's on each head that was red, a claim's on each sha the
// Queue's rewrites gave it. Pages are read back until one reaches `sinceMs`, so a count kept within a span sees every
// Attempt in it however many comments landed since, and `Date.now()` reads the newest page alone
export const readNewestCommitComments = (sinceMs: number): GitHubEntry[] => {
  const { name, owner } = readRepository();
  const comments: GitHubEntry[] = [];
  let startCursor: null | string = null;
  do {
    // Typed, since the cursor it reads is assigned from the page it fetches
    const cursorArgs: string[] = startCursor === null ? [] : ["-f", `startCursor=${startCursor}`];
    const { nodes, pageInfo } = parseMachineJson<CommitCommentsPage>(
      runGh([
        "api",
        "graphql",
        "-f",
        `owner=${owner.login}`,
        "-f",
        `name=${name}`,
        ...cursorArgs,
        "-f",
        `query=${QUERY}`,
      ]),
    ).data.repository.commitComments;
    comments.unshift(
      ...nodes.map(({ author, body, createdAt, databaseId }) => ({
        body,
        id: databaseId,
        updated_at: createdAt,
        user: { login: author?.login ?? "" },
      })),
    );
    const oldest = nodes[0];
    startCursor =
      pageInfo.hasPreviousPage && oldest !== undefined && Date.parse(oldest.createdAt) > sinceMs
        ? pageInfo.startCursor
        : null;
  } while (startCursor !== null);
  return comments;
};
