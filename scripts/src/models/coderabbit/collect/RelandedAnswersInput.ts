import type { AnsweredCommit } from "#src/models/coderabbit/collect/AnsweredCommit";
import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

export interface RelandedAnswersInput {
  // The re-landed copy of a parked fix, with the findings its trailers say it answers
  commit: AnsweredCommit;
  isDryRun: boolean;
  viewerLogin: string;
  // Every window pull request, a folded one read as merged (`markFoldedWindowsMerged`)
  windowHistory: WindowPullRequest[];
}
