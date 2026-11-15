// What the plugin's node script answers: the seven answers, or why none were recorded
import type { SinStatusKind } from "./SinStatusKind";

export type SinsResult =
  | { answers: Record<string, { confidence: number; score: number }>; result: typeof SinStatusKind.Answered }
  | {
      reason?: string;
      result: typeof SinStatusKind.Failed | typeof SinStatusKind.NodeTooOld | typeof SinStatusKind.NoKey;
    };
