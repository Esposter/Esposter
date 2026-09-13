import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

export interface GitHubReview extends GitHubEntry {
  commit_id: string;
  submitted_at: string;
}
