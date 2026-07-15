// The owner-only Status blade shape — keyValue answers "who hasn't answered yet".
// The ProgramStatus dataset drops both keyValue and token for publicId, because a dataset flows into
// Dashboards and a dashboard is publishable: keyValue is the participant list and token is the
// Credential that responds on their behalf, so neither can be the published identity
export interface ProgramStatusRow {
  addedAt: Date;
  isResponded: boolean;
  keyValue: string;
  publicId: string;
  token: string;
}
