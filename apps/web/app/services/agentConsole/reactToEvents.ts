import type { AgentConsoleTheme } from "@/models/agentConsole/AgentConsoleTheme";
import type { AgentEvent } from "agent-console-server/contracts";

import { AgentConsoleReaction } from "@/models/agentConsole/AgentConsoleReaction";
import { notifyWhenHidden } from "@/services/agentConsole/notifyWhenHidden";
import { AgentEventType } from "agent-console-server/contracts";

// A turn ending or a prompt waiting on a verdict. The console notifies a hidden tab of it for every theme, and then the
// Theme reacts on top of that. Only events that happened after the page connected count: a replayed log is history, and
// A reload must not ring for every turn it already showed
export const reactToEvents = (
  theme: AgentConsoleTheme,
  sessionTitle: string,
  events: AgentEvent[],
  connectedAt: Date,
) => {
  const react = (reaction: AgentConsoleReaction, title: string, body: string) => {
    notifyWhenHidden(title, body);
    theme.reactions[reaction]?.(title, body);
  };

  for (const event of events)
    if (event.createdAt < connectedAt) continue;
    else if (event.type === AgentEventType.TurnResult)
      react(AgentConsoleReaction.TurnEnded, sessionTitle, event.isError ? event.subtype : event.result);
    else if (event.type === AgentEventType.PermissionRequest)
      react(AgentConsoleReaction.AttentionNeeded, sessionTitle, `${event.toolName} is waiting for permission`);
};
