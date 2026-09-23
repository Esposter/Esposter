import type { OpenSession } from "#src/models/claudeAgentSdk/OpenSession";
import type { SessionOpenerContext } from "#src/models/claudeAgentSdk/SessionOpenerContext";

import { closeOpenSession } from "#src/services/drivers/claudeAgentSdk/closeOpenSession";
import { getSessionTitle } from "#src/services/drivers/claudeAgentSdk/getSessionTitle";
import { toCapabilitiesEvent } from "#src/services/drivers/claudeAgentSdk/toCapabilitiesEvent";
import { toContextUsageEvent } from "#src/services/drivers/claudeAgentSdk/toContextUsageEvent";
import { getSessionInfo } from "@anthropic-ai/claude-agent-sdk";
import { getResultAsync } from "@esposter/shared";
// Reads an open session's query until it ends, mapping every message, and closes the session however it ended. A
// Failed side read — the palette's commands, the context gauge, the title — is logged and the session carries on.
export const watchSession = async (
  sessionId: string,
  openSession: OpenSession,
  {
    emit,
    onSessionsChange,
    openSessionMap,
  }: Pick<SessionOpenerContext, "emit" | "onSessionsChange" | "openSessionMap">,
): Promise<void> => {
  const { cwd, mapper, query } = openSession;
  const readContextUsage = () =>
    getResultAsync(() => query.getContextUsage()).match((contextUsage) => {
      emit(sessionId, [toContextUsageEvent(crypto.randomUUID(), contextUsage, new Date())]);
    }, console.error);
  const readTitle = () =>
    // oxlint-disable-next-line id-denylist -- `dir` is the SDK's own option name
    getResultAsync(() => getSessionInfo(sessionId, { dir: cwd })).match((sessionInfo) => {
      if (!sessionInfo) return;
      openSession.title = getSessionTitle(sessionInfo) || openSession.title;
      onSessionsChange();
    }, console.error);
  await Promise.all([
    getResultAsync(() => Promise.all([query.supportedCommands(), query.supportedModels()])).match(
      ([slashCommands, models]) => {
        emit(sessionId, [toCapabilitiesEvent(crypto.randomUUID(), slashCommands, models, new Date())]);
      },
      (error) => {
        console.error(error);
      },
    ),
    readContextUsage(),
    getResultAsync(async () => {
      for await (const message of query) {
        emit(sessionId, mapper.mapMessage(message, new Date()));
        if (message.type === "result") await Promise.all([readContextUsage(), readTitle()]);
      }
    }).match(
      () => {
        closeOpenSession(sessionId, openSession, "", { emit, onSessionsChange, openSessionMap });
      },
      (error) => {
        closeOpenSession(sessionId, openSession, error.message, { emit, onSessionsChange, openSessionMap });
      },
    ),
  ]);
};
