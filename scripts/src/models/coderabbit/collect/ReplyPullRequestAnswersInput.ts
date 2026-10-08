import type { AnsweredCommit } from "#src/models/coderabbit/collect/AnsweredCommit";

export interface ReplyPullRequestAnswersInput {
  // The commits whose trailers name what they answer — each reply is posted only for the pull request it belongs to
  commits: AnsweredCommit[];
  isDryRun: boolean;
  pullRequest: number;
  viewerLogin: string;
}
