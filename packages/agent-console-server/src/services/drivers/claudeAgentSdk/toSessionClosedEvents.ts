import type { AgentEvent } from "#src/models/event/AgentEvent";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { SessionState } from "#src/models/session/SessionState";
import { getEventId } from "#src/services/drivers/claudeAgentSdk/getEventId";

// A session's closed state, after the error that closed it when there was one
export const toSessionClosedEvents = (message: string): AgentEvent[] => {
  const createdAt = new Date();
  const closedId = getEventId(crypto.randomUUID(), AgentEventType.SessionState);
  return [
    ...(message
      ? [
          {
            createdAt,
            id: getEventId(closedId, AgentEventType.HostError),
            message,
            type: AgentEventType.HostError,
          } as const,
        ]
      : []),
    { createdAt, id: closedId, state: SessionState.Closed, type: AgentEventType.SessionState },
  ];
};
