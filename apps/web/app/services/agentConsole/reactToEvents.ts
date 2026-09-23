import type { AgentConsoleTheme } from "@/models/agentConsole/AgentConsoleTheme";
import type { AgentEvent } from "agent-console-server/contracts";

import { AgentConsoleReaction } from "@/models/agentConsole/AgentConsoleReaction";
import { AgentEventType } from "agent-console-server/contracts";
// A turn ending or a prompt waiting on a verdict, handed to the theme. Only events that happened after the page
// Connected count: a replayed log is history, and a reload must not ring for every turn it already showed
export const reactToEvents = (
  theme: AgentConsoleTheme,
  sessionTitle: string,
  events: AgentEvent[],
  connectedAt: Date,
) => {
  for (const event of events) {
    if (event.createdAt < connectedAt) continue;
    else if (event.type === AgentEventType.TurnResult)
      theme.reactions[AgentConsoleReaction.TurnEnded](sessionTitle, event.isError ? event.subtype : event.result);
    else if (event.type === AgentEventType.PermissionRequest)
      theme.reactions[AgentConsoleReaction.AttentionNeeded](
        sessionTitle,
        `${event.toolName} is waiting for permission`,
      );
  }
};
