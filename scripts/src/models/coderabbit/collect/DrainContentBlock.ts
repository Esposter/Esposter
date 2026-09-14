// A block of one assistant turn on Claude Code's `stream-json` output: the prose between tool calls, a tool
// Call with the input it was given, or the model's own reasoning, which the log carries none of — a thinking
// Block is how the turn was decided, not what the session did. Field names are the wire format's own.
export type DrainContentBlock =
  | { input: Record<string, unknown>; name: string; type: "tool_use" }
  | { text: string; type: "text" }
  | { type: "thinking" };
