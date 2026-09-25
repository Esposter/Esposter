import type { AgentEvent, SessionSummary } from "agent-console-server/contracts";

import { CONTEXT_WARNING_RATIO } from "@/services/agentConsole/constants";
import { createSessionView } from "@/services/agentConsole/createSessionView";
import { foldAgentEvents } from "@/services/agentConsole/foldAgentEvents";
import { AgentConsoleThemeMap } from "@/services/agentConsole/themes/AgentConsoleThemeMap";
import { toWorldFigures } from "@/services/agentConsole/world/toWorldFigures";
import { AgentEventType, SessionState } from "agent-console-server/contracts";

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
  // Where each agent stands in the room, which the figures walk to and the main agent's prompt is measured from
  const worldFigures = computed(() =>
    currentSessionId.value ? toWorldFigures(timelineLanes.value, pendingPermissionRequests.value.length > 0) : [],
  );
  // Who the session is presented as, by the first theme that finds its own line in a session-start hook's context
  const avatar = computed(() => {
    for (const sessionStartContext of sessionView.value.sessionStartContexts)
      for (const theme of Object.values(AgentConsoleThemeMap)) {
        const themeAvatar = theme.getAvatar(sessionStartContext);
        if (themeAvatar) return themeAvatar;
      }

    return "";
  });
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
  // A turn is under way, a permission request or a compaction inside it included: what Escape and the stop button end
  const isTurnRunning = computed(() =>
    [SessionState.Compacting, SessionState.RequiresAction, SessionState.Running].includes(
      sessionState.value ?? SessionState.Idle,
    ),
  );
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
    avatar,
    capabilities,
    contextUsage,
    conversationEvents,
    currentSession,
    currentSessionId,
    fileEdits,
    fileOriginMap,
    isContextNearCompaction,
    isTurnRunning,
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
    worldFigures,
  };
});
