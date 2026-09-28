import type { AgentEvent } from "#src/models/event/AgentEvent";

import { AgentEventType } from "#src/models/event/AgentEventType";

// The line a session's window prints for an event, or "" for one it leaves to the page: the conversation, the tools
// Claude reaches for and the permission it waits on, plainly, and none of a subagent's own
export const formatSessionLogLine = (event: AgentEvent): string => {
  switch (event.type) {
    case AgentEventType.AssistantMessage:
      return event.parentToolUseId ? "" : `Claude: ${event.text}`;
    case AgentEventType.HostError:
      return `Error: ${event.message}`;
    case AgentEventType.PermissionRequest:
      return `Claude asks to use ${event.toolName}. Answer in the page.`;
    case AgentEventType.ToolUse:
      return event.parentToolUseId ? "" : `Claude uses ${event.name}`;
    case AgentEventType.UserMessage:
      return event.parentToolUseId ? "" : `You: ${event.text}`;
    default:
      return "";
  }
};
