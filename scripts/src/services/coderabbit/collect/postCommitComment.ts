import { runGh } from "#src/services/shared/runGh";

// The one writer for a commit's own conversation — the record for a fact about a queue commit that outlives any
// Pull request, since the queue is synced with none open as often as with one
export const postCommitComment = (sha: string, body: string): string =>
  runGh(["api", `repos/{owner}/{repo}/commits/${sha}/comments`, "-f", `body=${body}`]);
