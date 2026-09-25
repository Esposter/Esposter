import type { Attempts } from "#src/models/coderabbit/collect/Attempts";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

export interface CommitAttempts extends Attempts {
  // The commit's comments the count was read from, for a step that looks for a notice of its own there too
  comments: GitHubEntry[];
}
