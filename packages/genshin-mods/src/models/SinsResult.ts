// What the plugin's node script answers: the seven answers, or why none were recorded
export type SinsResult =
  | { answers: Record<string, { confidence: number; score: number }>; result: "answered" }
  | { reason?: string; result: "failed" | "no-key" | "node-too-old" };
