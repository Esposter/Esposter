import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

export interface CommitAttempts {
  // How many attempts had already failed, which is what the step compares against the cap
  attempts: number;
  // The commit's comments the count was read from, for a step that looks for a notice of its own there too
  comments: GitHubEntry[];
  // Records this attempt's failure where the count was read and under the marker it counted (`getAttemptFailure`)
  recordFailure: (task: string, detail?: string) => void;
}
