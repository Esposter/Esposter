import type { GitHubEntry } from "#src/models/coderabbit/GitHubEntry";

// A REST review comment. `in_reply_to_id` keeps GitHub's spelling and is present only on a reply.
export interface PullRequestComment extends GitHubEntry {
  in_reply_to_id?: number;
}
