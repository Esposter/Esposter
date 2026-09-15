import type { AnsweredCommit } from "#src/models/coderabbit/collect/AnsweredCommit";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

export interface ReplyAnsweredInput {
  // The commits on `develop` whose trailers name what they answer — the range differs per call, the read is the
  // Caller's
  commits: AnsweredCommit[];
  isDryRun: boolean;
  // The pull request's issue comments, read once by the caller — the verdict markers live in them
  issueComments: GitHubEntry[];
  pullRequest: number;
  viewerLogin: string;
}
