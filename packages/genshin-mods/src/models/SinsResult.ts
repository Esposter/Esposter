// What the plugin's node script answers: the seven answers, or why none were recorded
import type { SinStatusKind } from "./SinStatusKind";

export type SinsResult =
  | { answers: Record<string, { confidence: number; score: number }>; result: SinStatusKind.Answered }
  | { reason?: string; result: SinStatusKind.Failed | SinStatusKind.NodeTooOld | SinStatusKind.NoKey };
