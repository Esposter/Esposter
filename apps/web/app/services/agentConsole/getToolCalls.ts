import type { ToolCall } from "@/models/agentConsole/ToolCall";
import type { AgentEvent } from "agent-console-server/contracts";

import { AgentEventType } from "agent-console-server/contracts";
// Every tool call in the order it was made, each joined to its result and its latest progress
export const getToolCalls = (events: AgentEvent[]): ToolCall[] => {
  const toolCallMap = new Map<string, ToolCall>();

  for (const event of events)
    if (event.type === AgentEventType.ToolUse) toolCallMap.set(event.toolUseId, { elapsedSeconds: 0, toolUse: event });
    else if (event.type === AgentEventType.ToolResult) {
      const toolCall = toolCallMap.get(event.toolUseId);
      if (toolCall) toolCall.result = event;
    } else if (event.type === AgentEventType.ToolProgress) {
      const toolCall = toolCallMap.get(event.toolUseId);
      if (toolCall) toolCall.elapsedSeconds = event.elapsedSeconds;
    }

  return [...toolCallMap.values()];
};
