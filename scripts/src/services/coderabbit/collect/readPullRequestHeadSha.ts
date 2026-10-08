import { runGh } from "#src/services/shared/runGh";

// The sha a pull request's head holds now — what a skipped incremental pass is measured against, since the bot's
// Own review names only the commit it read
export const readPullRequestHeadSha = (pullRequest: number): string =>
  runGh(["api", `repos/{owner}/{repo}/pulls/${pullRequest}`, "--jq", ".head.sha"]).trim();
