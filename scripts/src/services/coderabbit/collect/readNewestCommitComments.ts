import type { CommitCommentsPage } from "#src/models/coderabbit/collect/CommitCommentsPage";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { readRepository } from "#src/services/coderabbit/shared/readRepository";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

const QUERY = `
query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    commitComments(last: 100) { nodes { author { login } body createdAt databaseId } }
  }
}`;
// Every commit's comments at once — the newest page of them, in one call — for a count whose attempts are posted on
// Whichever commit was at hand and must be read whatever commit is at hand now: a red's on each head that was red, a
// Claim's on each sha the queue's rewrites gave it
export const readNewestCommitComments = (): GitHubEntry[] => {
  const { name, owner } = readRepository();
  return parseMachineJson<CommitCommentsPage>(
    runGh(["api", "graphql", "-f", `owner=${owner.login}`, "-f", `name=${name}`, "-f", `query=${QUERY}`]),
  ).data.repository.commitComments.nodes.map(({ author, body, createdAt, databaseId }) => ({
    body,
    id: databaseId,
    updated_at: createdAt,
    user: { login: author?.login ?? "" },
  }));
};
