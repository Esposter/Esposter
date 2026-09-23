import type { AgentEvent } from "agent-console-server/contracts";

import { AgentEventType } from "agent-console-server/contracts";
// The text a search over the session matches an event by — what the event shows, not its metadata
export const getEventSearchText = (event: AgentEvent): string => {
  switch (event.type) {
    case AgentEventType.AssistantMessage:
    case AgentEventType.UserMessage:
      return event.text;
    case AgentEventType.CommandOutput:
      return event.content;
    case AgentEventType.FileRewind:
      return event.filePaths.join(" ");
    case AgentEventType.Hook:
      return `${event.hookEvent} ${event.output}`;
    case AgentEventType.HostError:
      return event.message;
    case AgentEventType.Thinking:
      return event.thinking;
    case AgentEventType.ToolResult:
      return event.content;
    case AgentEventType.ToolUse:
      return `${event.name} ${JSON.stringify(event.input)}`;
    case AgentEventType.Unknown:
      return event.raw;
    default:
      return "";
  }
};
