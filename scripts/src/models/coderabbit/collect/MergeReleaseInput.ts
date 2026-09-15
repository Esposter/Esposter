export interface MergeReleaseInput {
  // The head the risk verdict covers — the merge is refused if the pull request left it
  developSha: string;
  isDryRun: boolean;
  pullRequest: number;
}
