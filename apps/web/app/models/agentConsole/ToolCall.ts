import type { ToolResultEvent, ToolUseEvent } from "agent-console-server/contracts";

// A tool call with whatever has come back for it so far: its result once it finished, and how long it has been
// Running while it has not
export interface ToolCall {
  elapsedSeconds: number;
  result?: ToolResultEvent;
  toolUse: ToolUseEvent;
}
