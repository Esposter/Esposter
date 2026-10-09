import type { CommitCommentsPage } from "#src/models/coderabbit/collect/CommitCommentsPage";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { REPAIR_SIGNATURE_SPAN_MS } from "#src/services/coderabbit/collect/constants";
import { readRepository } from "#src/services/coderabbit/shared/readRepository";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

const QUERY = `
query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    commitComments(last: 100) { nodes { author { login } body createdAt databaseId } }
  }
}`;
// The record a red's repair attempts are counted over: each is posted on the head that was red, and a window merged
// Over it makes another head with the same red, so the count reads every commit's comments at once — the newest page
// Of them, in one call, kept within the span a signature's attempts are counted over (`REPAIR_SIGNATURE_SPAN_MS`)
export const readSignatureAttempts = (): GitHubEntry[] => {
  const { name, owner } = readRepository();
  const sinceMs = Date.now() - REPAIR_SIGNATURE_SPAN_MS;
  return parseMachineJson<CommitCommentsPage>(
    runGh(["api", "graphql", "-f", `owner=${owner.login}`, "-f", `name=${name}`, "-f", `query=${QUERY}`]),
  )
    .data.repository.commitComments.nodes.filter(
      ({ createdAt }) => Temporal.Instant.from(createdAt).epochMilliseconds > sinceMs,
    )
    .map(({ author, body, createdAt, databaseId }) => ({
      body,
      id: databaseId,
      updated_at: createdAt,
      user: { login: author?.login ?? "" },
    }));
};
