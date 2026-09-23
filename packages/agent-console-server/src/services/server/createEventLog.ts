import type { AgentEvent } from "#src/models/event/AgentEvent";
import type { EventLog } from "#src/models/server/EventLog";

import { getOrCreate } from "@esposter/shared";
// Every open session's events since it was opened, replayed to a page that connects mid-session. An event already
// Logged under its id is dropped here, so the page never sees one twice however many paths reported it.
export const createEventLog = (): EventLog => {
  const sessionEventMap = new Map<string, { eventIds: Set<string>; events: AgentEvent[] }>();

  return {
    append: (sessionId, events) => {
      const sessionEvents = getOrCreate(sessionEventMap, sessionId, () => ({
        eventIds: new Set<string>(),
        events: [],
      }));

      const newEvents: AgentEvent[] = [];
      for (const event of events) {
        if (sessionEvents.eventIds.has(event.id)) continue;
        sessionEvents.eventIds.add(event.id);
        sessionEvents.events.push(event);
        newEvents.push(event);
      }
      return newEvents;
    },
    entries: () => Array.from(sessionEventMap, ([sessionId, { events }]) => [sessionId, events] as const),
    reset: (sessionId) => {
      sessionEventMap.delete(sessionId);
    },
  };
};
