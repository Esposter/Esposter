import type { TimelineLane } from "@/models/agentConsole/TimelineLane";
import type { ToolCall } from "@/models/agentConsole/ToolCall";
import type { AgentEvent } from "agent-console-server/contracts";

import { MAIN_LANE_TITLE } from "@/services/agentConsole/constants";
import { getOrCreate } from "@esposter/shared";
import { AgentEventType } from "agent-console-server/contracts";

// The tool calls split by the agent that made them, the main agent first and each subagent in the order it started,
// Titled by what it was asked to do and marked with where it has got to
export const getTimelineLanes = (toolCalls: ToolCall[], events: AgentEvent[]): TimelineLane[] => {
  const laneMap = new Map<string, TimelineLane>([["", { id: "", title: MAIN_LANE_TITLE, toolCalls: [] }]]);

  for (const event of events)
    if (event.type === AgentEventType.Subagent && event.toolUseId) {
      const lane = getOrCreate(laneMap, event.toolUseId, () => ({ id: event.toolUseId, title: "", toolCalls: [] }));
      lane.status = event.status;
      // The task it was started with names the lane; a progress description is only what it is doing right now
      lane.title ||= event.description || event.subagentType;
    }

  for (const toolCall of toolCalls)
    getOrCreate(laneMap, toolCall.toolUse.parentToolUseId, () => ({
      id: toolCall.toolUse.parentToolUseId,
      title: "",
      toolCalls: [],
    })).toolCalls.push(toolCall);

  return [...laneMap.values()];
};
