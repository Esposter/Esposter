import type { SessionSummary } from "#src/models/session/SessionSummary";

import { SessionState } from "#src/models/session/SessionState";
import { SESSION_LIST_LIMIT } from "#src/services/drivers/claudeAgentSdk/constants";
import { getSessionTitle } from "#src/services/drivers/claudeAgentSdk/getSessionTitle";
import { listSessions } from "@anthropic-ai/claude-agent-sdk";

// The sessions on disk, each open one shown as it is now. A session opened but not yet prompted has no transcript on
// Disk, and is listed all the same
export const listSessionSummaries = async (
  openSessionMap: ReadonlyMap<string, Pick<SessionSummary, "cwd" | "lastActivityAt" | "state" | "title">>,
): Promise<SessionSummary[]> => {
  const sessionInfos = await listSessions({ limit: SESSION_LIST_LIMIT });
  const savedSessionIds = new Set(sessionInfos.map(({ sessionId }) => sessionId));
  const unsavedSessions = [...openSessionMap]
    .filter(([id]) => !savedSessionIds.has(id))
    .map(([id, { cwd, lastActivityAt, state, title }]) => ({ cwd, id, lastActivityAt, state, title }));
  const savedSessions = sessionInfos.map((sessionInfo) => {
    const openSession = openSessionMap.get(sessionInfo.sessionId);
    return {
      cwd: sessionInfo.cwd ?? "",
      id: sessionInfo.sessionId,
      lastActivityAt: openSession?.lastActivityAt ?? new Date(sessionInfo.lastModified),
      state: openSession?.state ?? SessionState.Closed,
      title: openSession?.title || getSessionTitle(sessionInfo),
    };
  });
  return [...unsavedSessions, ...savedSessions];
};
