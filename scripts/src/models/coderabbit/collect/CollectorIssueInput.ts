export interface CollectorIssueInput {
  body: string;
  isDryRun: boolean;
  // The hidden marker that keys the issue, so a later run finding it open opens no second one
  marker: string;
  title: string;
  viewerLogin: string;
}
