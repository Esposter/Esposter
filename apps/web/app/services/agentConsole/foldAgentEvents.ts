import type { SessionView } from "@/models/agentConsole/SessionView";
import type { TimelineLane } from "@/models/agentConsole/TimelineLane";
import type { AgentEvent } from "agent-console-server/contracts";

import { checkIsConversationEvent } from "@/services/agentConsole/checkIsConversationEvent";
import { toFileEdits } from "@/services/agentConsole/toFileEdits";
import { exhaustiveGuard, getOrCreate } from "@esposter/shared";
import { AgentEventType } from "agent-console-server/contracts";

const getOrCreateTimelineLane = (sessionView: SessionView, id: string): TimelineLane =>
  getOrCreate(sessionView.timelineLaneMap, id, () => ({ id, title: "", toolCalls: [] }));
// Folds events into the session's view, touching only what each one changes, and returns the ones it had not folded
// Before — an event arrives more than once when a replay after a reconnect overlaps what the page already holds
export const foldAgentEvents = (sessionView: SessionView, events: AgentEvent[]) => {
  const addedEvents: AgentEvent[] = [];

  for (const event of events) {
    if (sessionView.eventIds.has(event.id)) continue;
    sessionView.eventIds.add(event.id);
    addedEvents.push(event);
    Object.assign(sessionView.latestEventMap, { [event.type]: event });
    if (checkIsConversationEvent(event)) sessionView.conversationEvents.push(event);

    switch (event.type) {
      case AgentEventType.AssistantMessage:
      case AgentEventType.Capabilities:
      case AgentEventType.CommandOutput:
      case AgentEventType.Compaction:
      case AgentEventType.ContextUsage:
      case AgentEventType.Hook:
      case AgentEventType.HostError:
      case AgentEventType.RateLimit:
      case AgentEventType.SessionInit:
      case AgentEventType.SessionSettings:
      case AgentEventType.SessionState:
      case AgentEventType.Thinking:
      case AgentEventType.TodoUpdate:
      case AgentEventType.TurnResult:
      case AgentEventType.Unknown:
      case AgentEventType.UserMessage:
        break;
      case AgentEventType.PermissionRequest:
        sessionView.pendingPermissionRequestMap.set(event.requestId, event);
        break;
      case AgentEventType.PermissionResolution:
        sessionView.pendingPermissionRequestMap.delete(event.requestId);
        break;
      case AgentEventType.Subagent: {
        if (!event.toolUseId) break;
        const timelineLane = getOrCreateTimelineLane(sessionView, event.toolUseId);
        timelineLane.status = event.status;
        // The task it was started with names the lane; a progress description is only what it is doing right now
        timelineLane.title ||= event.description || event.subagentType;
        break;
      }
      case AgentEventType.ToolProgress: {
        const toolCall = sessionView.toolCallMap.get(event.toolUseId);
        if (toolCall) toolCall.elapsedSeconds = event.elapsedSeconds;
        break;
      }
      case AgentEventType.ToolResult: {
        const toolCall = sessionView.toolCallMap.get(event.toolUseId);
        if (!toolCall) break;
        toolCall.result = event;
        if (event.isError) sessionView.fileEditMap.delete(event.toolUseId);
        break;
      }
      case AgentEventType.ToolUse: {
        const toolCall = { elapsedSeconds: 0, toolUse: event };
        sessionView.toolCallMap.set(event.toolUseId, toolCall);
        getOrCreateTimelineLane(sessionView, event.parentToolUseId).toolCalls.push(toolCall);
        // One still waiting on its result is kept, since it is what a pending permission request is about
        const fileEdits = toFileEdits(event.name, event.input, event.toolUseId);
        if (fileEdits.length > 0) sessionView.fileEditMap.set(event.toolUseId, fileEdits);
        break;
      }
      default:
        exhaustiveGuard(event);
    }
  }

  return addedEvents;
};
