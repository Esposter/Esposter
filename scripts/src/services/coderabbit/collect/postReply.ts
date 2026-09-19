import { runGh } from "#src/services/shared/runGh";

// The reply under one inline finding, which `gh pr comment` cannot address — the REST endpoint is the only way in
export const postReply = (pullRequest: number, commentId: number, body: string): string =>
  runGh(["api", `repos/{owner}/{repo}/pulls/${pullRequest}/comments/${commentId}/replies`, "-f", `body=${body}`]);
