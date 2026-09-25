import type { ToolCall } from "@/models/agentConsole/ToolCall";
import type { SubagentStatus } from "agent-console-server/contracts";

// One agent's tool calls: the main agent's under an empty id, and each subagent's under the Task call that started it
export interface TimelineLane {
  id: string;
  status?: SubagentStatus;
  title: string;
  toolCalls: ToolCall[];
}
