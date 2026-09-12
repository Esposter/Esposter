import type { GitHubEntry } from "#src/coderabbit/models/GitHubEntry";

export interface GitHubReview extends GitHubEntry {
  commit_id: string;
  submitted_at: string;
}
