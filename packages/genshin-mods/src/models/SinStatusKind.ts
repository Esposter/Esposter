// What the sins mod last found: its scores when the call answered, or why it could not score the last prompt
export const SinStatusKind = {
  Answered: "answered",
  Failed: "failed",
  NodeTooOld: "node-too-old",
  NoKey: "no-key",
  Unchecked: "unchecked",
} as const;
export type SinStatusKind = (typeof SinStatusKind)[keyof typeof SinStatusKind];
