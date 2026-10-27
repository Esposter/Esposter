// What the sins mod last found: its scores when the call answered, or why it could not score the last prompt
export enum SinStatusKind {
  Answered = "answered",
  Failed = "failed",
  NoKey = "no-key",
  NodeTooOld = "node-too-old",
  Unchecked = "unchecked",
}
