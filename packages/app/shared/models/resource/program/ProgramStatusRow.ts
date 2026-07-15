// The owner-only Status blade shape — keyValue answers "who hasn't answered yet".
// The ProgramStatus dataset deliberately drops keyValue for the opaque token, because a dataset
// Flows into dashboards and a dashboard is publishable
export interface ProgramStatusRow {
  invitedAt: Date;
  isResponded: boolean;
  keyValue: string;
  token: string;
}
