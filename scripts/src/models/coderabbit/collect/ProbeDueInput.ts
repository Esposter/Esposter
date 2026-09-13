import type { GitHubEntry } from "#src/models/coderabbit/GitHubEntry";

export interface ProbeDueInput {
  // The develop head's own commit time: a retrigger older than the head answered a range that no longer exists
  headCommittedAtMs: number;
  issueComments: GitHubEntry[];
  nowMs: number;
  viewerLogin: string;
}
