import type { AgentEvent, SessionSummary } from "agent-console-server/contracts";

import { getFileEdits } from "@/services/agentConsole/getFileEdits";
import { getLatestEvent } from "@/services/agentConsole/getLatestEvent";
import { getPendingPermissionRequests } from "@/services/agentConsole/getPendingPermissionRequests";
import { getToolCalls } from "@/services/agentConsole/getToolCalls";
import { AgentEventType } from "agent-console-server/contracts";
// The host's sessions and each one's event log, and everything the work surface reads off the current one. The log
// Is the only state: the header, the timeline, the diffs and the cards are all views of it, so a reconnect that
// Replays the log rebuilds every one of them
export const useAgentConsoleSessionStore = defineStore("agentConsole/session", () => {
  const sessions = ref<SessionSummary[]>([]);
  const currentSessionId = ref("");
  const { data: events, getDataRef } = useDataMap<AgentEvent[]>(currentSessionId, []);
  const currentSession = computed(() => sessions.value.find(({ id }) => id === currentSessionId.value));
  const toolCalls = computed(() => getToolCalls(events.value));
  const fileEdits = computed(() => getFileEdits(toolCalls.value));
  const pendingPermissionRequests = computed(() => getPendingPermissionRequests(events.value));
  const sessionInit = computed(() => getLatestEvent(events.value, AgentEventType.SessionInit));
  const sessionSettings = computed(() => getLatestEvent(events.value, AgentEventType.SessionSettings));
  const capabilities = computed(() => getLatestEvent(events.value, AgentEventType.Capabilities));
  const contextUsage = computed(() => getLatestEvent(events.value, AgentEventType.ContextUsage));
  const rateLimit = computed(() => getLatestEvent(events.value, AgentEventType.RateLimit));
  const todoUpdate = computed(() => getLatestEvent(events.value, AgentEventType.TodoUpdate));
  const turnResult = computed(() => getLatestEvent(events.value, AgentEventType.TurnResult));
  const sessionState = computed(() => getLatestEvent(events.value, AgentEventType.SessionState)?.state);

  const storeSessions = (newSessions: SessionSummary[]) => {
    sessions.value = newSessions;
  };
  // A log arrives more than once — a replay after a reconnect overlaps what the page already holds — so an event is
  // Appended once per id
  const storeEvents = (sessionId: string, newEvents: AgentEvent[]) => {
    const sessionEvents = getDataRef(sessionId);
    const eventIds = new Set(sessionEvents.value.map(({ id }) => id));
    const addedEvents = newEvents.filter(({ id }) => !eventIds.has(id));
    if (addedEvents.length > 0) sessionEvents.value = [...sessionEvents.value, ...addedEvents];
    return addedEvents;
  };
  const storeSessionReset = (sessionId: string) => {
    getDataRef(sessionId).value = [];
  };

  return {
    capabilities,
    contextUsage,
    currentSession,
    currentSessionId,
    events,
    fileEdits,
    pendingPermissionRequests,
    rateLimit,
    sessionInit,
    sessions,
    sessionSettings,
    sessionState,
    storeEvents,
    storeSessionReset,
    storeSessions,
    todoUpdate,
    toolCalls,
    turnResult,
  };
});
