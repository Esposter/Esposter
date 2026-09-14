// The bot's verdict on merging the release pull request as it stands, read off its walkthrough
export interface MergeRisk {
  // The head the verdict covers — a verdict on an older head says nothing about the window pushed since
  coveredSha: string;
  level: string;
}
