// A block of one assistant turn on Claude Code's `stream-json` output: the prose between tool calls, or a tool
// Call with the input it was given. Field names are the wire format's own.
export type DrainContentBlock =
  | { input: Record<string, unknown>; name: string; type: "tool_use" }
  | { text: string; type: "text" };
