import type { AgentEvent, SessionSummary } from "agent-console-server/contracts";

import { CONTEXT_WARNING_RATIO } from "@/services/agentConsole/constants";
import { createSessionView } from "@/services/agentConsole/createSessionView";
import { foldAgentEvents } from "@/services/agentConsole/foldAgentEvents";
import { AgentEventType } from "agent-console-server/contracts";
// The host's sessions and each one's view of its event log. The log is the only state: everything the page shows is
// Folded from it as it arrives, so a reconnect that replays the log rebuilds every part of the page
export const useAgentConsoleSessionStore = defineStore("agentConsole/session", () => {
  const sessions = ref<SessionSummary[]>([]);
  const currentSessionId = ref("");
  const { data: sessionView, getDataRef } = useDataMap(currentSessionId, createSessionView);
  const currentSession = computed(() => sessions.value.find(({ id }) => id === currentSessionId.value));
  const conversationEvents = computed(() => sessionView.value.conversationEvents);
  const fileEdits = computed(() => [...sessionView.value.fileEditMap.values()].flat());
  const fileOriginMap = computed(() => sessionView.value.fileOriginMap);
  const pendingPermissionRequests = computed(() => [...sessionView.value.pendingPermissionRequestMap.values()]);
  const timelineLanes = computed(() => [...sessionView.value.timelineLaneMap.values()]);
  const streamDraft = computed(() => sessionView.value.streamDraft);
  const toolCallMap = computed(() => sessionView.value.toolCallMap);
  const capabilities = computed(() => sessionView.value.latestEventMap[AgentEventType.Capabilities]);
  const contextUsage = computed(() => sessionView.value.latestEventMap[AgentEventType.ContextUsage]);
  // Warns before automatic compaction rather than at it, which is the moment a person can still choose to compact
  const isContextNearCompaction = computed(() =>
    contextUsage.value?.autoCompactThreshold
      ? contextUsage.value.totalTokens >= contextUsage.value.autoCompactThreshold * CONTEXT_WARNING_RATIO
      : false,
  );
  const rateLimit = computed(() => sessionView.value.latestEventMap[AgentEventType.RateLimit]);
  const sessionSettings = computed(() => sessionView.value.latestEventMap[AgentEventType.SessionSettings]);
  const sessionState = computed(() => sessionView.value.latestEventMap[AgentEventType.SessionState]?.state);
  const todoUpdate = computed(() => sessionView.value.latestEventMap[AgentEventType.TodoUpdate]);
  const turnResult = computed(() => sessionView.value.latestEventMap[AgentEventType.TurnResult]);
  const turnUsage = computed(() => sessionView.value.latestEventMap[AgentEventType.TurnUsage]);

  const storeSessions = (newSessions: SessionSummary[]) => {
    sessions.value = newSessions;
  };
  const storeEvents = (sessionId: string, newEvents: AgentEvent[]) =>
    foldAgentEvents(getDataRef(sessionId).value, newEvents);
  const storeSessionReset = (sessionId: string) => {
    getDataRef(sessionId).value = createSessionView();
  };

  return {
    capabilities,
    contextUsage,
    conversationEvents,
    currentSession,
    currentSessionId,
    fileEdits,
    fileOriginMap,
    isContextNearCompaction,
    pendingPermissionRequests,
    rateLimit,
    sessions,
    sessionSettings,
    sessionState,
    storeEvents,
    storeSessionReset,
    storeSessions,
    streamDraft,
    timelineLanes,
    todoUpdate,
    toolCallMap,
    turnResult,
    turnUsage,
  };
});
