import type { ConnectionSessionSummary } from "@/models/agentConsole/ConnectionSessionSummary";
import type { SessionView } from "@/models/agentConsole/SessionView";

import { CONTEXT_WARNING_RATIO } from "@/services/agentConsole/constants";
import { AgentEventType, SessionState } from "agent-console-server/contracts";

// What a session's page reads off its view, for whichever session the id names. The console reads its current session
// Through this and the side chat reads its own, so the two read the same parts of their views and only the id differs
export const createSessionReads = (
  sessionId: Ref<string>,
  getDataRef: (key: string) => Ref<SessionView>,
  sessions: Ref<ConnectionSessionSummary[]>,
) => {
  const sessionView = computed(() => getDataRef(sessionId.value).value);
  const currentSession = computed(() => sessions.value.find(({ id }) => id === sessionId.value));
  const conversationEvents = computed(() => sessionView.value.conversationEvents);
  const fileEdits = computed(() => [...sessionView.value.fileEditMap.values()].flat());
  const diffCommentMap = computed(() => sessionView.value.diffCommentMap);
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
  // A turn is under way, a permission request or a compaction inside it included: what Escape and the stop button end
  const isTurnRunning = computed(() =>
    [SessionState.Compacting, SessionState.RequiresAction, SessionState.Running].includes(
      sessionState.value ?? SessionState.Idle,
    ),
  );
  const todoUpdate = computed(() => sessionView.value.latestEventMap[AgentEventType.TodoUpdate]);
  const turnResult = computed(() => sessionView.value.latestEventMap[AgentEventType.TurnResult]);
  const turnUsage = computed(() => sessionView.value.latestEventMap[AgentEventType.TurnUsage]);

  return {
    capabilities,
    contextUsage,
    conversationEvents,
    currentSession,
    diffCommentMap,
    fileEdits,
    fileOriginMap,
    isContextNearCompaction,
    isTurnRunning,
    pendingPermissionRequests,
    rateLimit,
    sessionSettings,
    sessionState,
    streamDraft,
    timelineLanes,
    todoUpdate,
    toolCallMap,
    turnResult,
    turnUsage,
  };
};
