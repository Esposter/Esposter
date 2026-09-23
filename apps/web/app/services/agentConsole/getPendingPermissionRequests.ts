import type { AgentEvent, PermissionRequestEvent } from "agent-console-server/contracts";

import { AgentEventType } from "agent-console-server/contracts";
// The permission prompts no verdict has settled yet, oldest first — the cards the page shows
export const getPendingPermissionRequests = (events: AgentEvent[]): PermissionRequestEvent[] => {
  const pendingRequestMap = new Map<string, PermissionRequestEvent>();
  for (const event of events)
    if (event.type === AgentEventType.PermissionRequest) pendingRequestMap.set(event.requestId, event);
    else if (event.type === AgentEventType.PermissionResolution) pendingRequestMap.delete(event.requestId);
  return [...pendingRequestMap.values()];
};
