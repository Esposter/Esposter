// The owner-only Status blade shape — keyValue answers "who hasn't answered yet".
// Neither the participant's token nor their publicId is on it: the blade renders neither, and the token is the
// Credential that responds on their behalf, so a read whose whole audience is a browser has no reason to carry
// It. The ProgramStatus dataset trades keyValue for publicId instead, because a dataset flows into Dashboards
// And a dashboard is publishable, so the participant list cannot be the published identity
export interface ProgramStatusRow {
  addedAt: Date;
  isResponded: boolean;
  keyValue: string;
}
// `isResponded` is read from a capped response scan, so a program whose survey holds more responses than that cap
// Reads some responders as awaiting. The blade counts responders out loud, so it is handed the flag rather than
// Left to present an undercount as the answer
export interface ProgramStatus {
  isRespondedPartial: boolean;
  rows: ProgramStatusRow[];
}
