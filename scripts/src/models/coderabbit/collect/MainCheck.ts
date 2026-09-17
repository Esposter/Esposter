// A workflow run as `gh run list --json` prints it, GitHub's own spelling
export interface MainCheck {
  conclusion: string;
  databaseId: number;
  status: string;
  url: string;
}
