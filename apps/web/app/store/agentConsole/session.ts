import type { ConnectionSessionSummary } from "@/models/agentConsole/ConnectionSessionSummary";
import type { DiffComment } from "@/models/agentConsole/DiffComment";
import type { AgentEvent, SessionSummary } from "agent-console-server/contracts";

import { createSessionReads } from "@/services/agentConsole/createSessionReads";
import { createSessionView } from "@/services/agentConsole/createSessionView";
import { foldAgentEvents } from "@/services/agentConsole/foldAgentEvents";
import { AgentConsoleThemeMap } from "@/services/agentConsole/themes/AgentConsoleThemeMap";
import { toDiffCommentKey } from "@/services/agentConsole/toDiffCommentKey";
import { SessionStorageKey } from "@/services/shared/SessionStorageKey";

// Every paired host's sessions and each one's view of its event log. The log is the only state: everything the page
// Shows is folded from it as it arrives, so a reconnect that replays the log rebuilds every part of the page
export const useAgentConsoleSessionStore = defineStore("agentConsole/session", () => {
  const sessions = ref<ConnectionSessionSummary[]>([]);
  // Kept through a reload of the page, so the session comes back once its host replays it
  const currentSessionId = useSessionStorage(SessionStorageKey.AgentConsoleSessionId, "");
  const { data: sessionView, deleteData, getDataRef } = useDataMap(currentSessionId, createSessionView);
  // The console's current session's reads; the side chat reads its own session through the same factory
  const sessionReads = createSessionReads(currentSessionId, getDataRef, sessions);
  // The first theme that finds its own line in a session-start hook's context presents that session, and its scene,
  // Which is handed the same context
  const themeContext = computed(() => {
    for (const sessionStartContext of sessionView.value.sessionStartContexts)
      for (const theme of Object.values(AgentConsoleThemeMap)) {
        const avatar = theme.getAvatar(sessionStartContext);
        if (avatar)
          return { avatar, palette: theme.getPalette(sessionStartContext), scene: theme.scene, sessionStartContext };
      }

    return { avatar: "", palette: {}, scene: undefined, sessionStartContext: "" };
  });
  const avatar = computed(() => themeContext.value.avatar);
  const themeScene = computed(() => themeContext.value.scene);
  const themeSessionStartContext = computed(() => themeContext.value.sessionStartContext);
  const themeStyle = computed(() =>
    Object.fromEntries(Object.entries(themeContext.value.palette).map(([token, value]) => [`--ui-${token}`, value])),
  );

  // A host's list replaces only that host's sessions, so every other host's stay as they were
  const storeSessions = (connectionId: string, newSessions: SessionSummary[]) => {
    sessions.value = [
      ...sessions.value.filter((session) => session.connectionId !== connectionId),
      ...newSessions.map((session) => ({ ...session, connectionId })),
    ];
  };
  const storeEvents = (sessionId: string, newEvents: AgentEvent[]) =>
    foldAgentEvents(getDataRef(sessionId).value, newEvents);
  // A replay rebuilds the session's view from its log, but a comment drafted on its diff is the person's own and is kept
  const storeSessionReset = (sessionId: string) => {
    const dataRef = getDataRef(sessionId);
    dataRef.value = { ...createSessionView(), diffCommentMap: dataRef.value.diffCommentMap };
  };
  const saveDiffComment = (diffComment: DiffComment) => {
    sessionView.value.diffCommentMap.set(toDiffCommentKey(diffComment), diffComment);
  };
  const deleteDiffComment = (diffCommentKey: string) => {
    sessionView.value.diffCommentMap.delete(diffCommentKey);
  };
  const clearDiffComments = () => {
    sessionView.value.diffCommentMap.clear();
  };

  return {
    ...sessionReads,
    avatar,
    clearDiffComments,
    currentSessionId,
    deleteData,
    deleteDiffComment,
    getDataRef,
    saveDiffComment,
    sessions,
    storeEvents,
    storeSessionReset,
    storeSessions,
    themeScene,
    themeSessionStartContext,
    themeStyle,
  };
});
