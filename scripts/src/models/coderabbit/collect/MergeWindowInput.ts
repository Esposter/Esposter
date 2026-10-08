export interface MergeWindowInput {
  // The head the review covers — the merge is refused if the pull request left it
  headSha: string;
  isDryRun: boolean;
  pullRequest: number;
}
