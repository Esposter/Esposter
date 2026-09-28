import type { ToolCall } from "@/models/agentConsole/ToolCall";
import type { SubagentStatus } from "agent-console-server/contracts";

// One agent's tool calls: the main agent's under an empty id, and each subagent's under the Task call that started it
export interface TimelineLane {
  id: string;
  status?: SubagentStatus;
  // The task a subagent's or a background command's lane runs as, which stopping it names; absent on the main lane
  taskId?: string;
  title: string;
  toolCalls: ToolCall[];
}
