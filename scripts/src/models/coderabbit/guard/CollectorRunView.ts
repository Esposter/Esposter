// One collector run as `gh run list --json createdAt,databaseId` prints it, GitHub's own spelling
export interface CollectorRunView {
  createdAt: string;
  databaseId: number;
}
