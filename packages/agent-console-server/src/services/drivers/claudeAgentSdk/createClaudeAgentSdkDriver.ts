import type { OpenSession } from "#src/models/claudeAgentSdk/OpenSession";
import type { Attachment } from "#src/models/command/Attachment";
import type { Driver } from "#src/models/driver/Driver";
import type { DriverCallbacks } from "#src/models/driver/DriverCallbacks";
import type { AgentEvent } from "#src/models/event/AgentEvent";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { SessionState } from "#src/models/session/SessionState";
import { closeOpenSession } from "#src/services/drivers/claudeAgentSdk/closeOpenSession";
import { SESSION_LIST_LIMIT } from "#src/services/drivers/claudeAgentSdk/constants";
import { createSessionOpener } from "#src/services/drivers/claudeAgentSdk/createSessionOpener";
import { getEventId } from "#src/services/drivers/claudeAgentSdk/getEventId";
import { getSessionTitle } from "#src/services/drivers/claudeAgentSdk/getSessionTitle";
import { readSessionCwd } from "#src/services/drivers/claudeAgentSdk/readSessionCwd";
import { toContentBlockParam } from "#src/services/drivers/claudeAgentSdk/toContentBlockParam";
import { createTaskRegistry } from "#src/services/shared/createTaskRegistry";
import { listSessions } from "@anthropic-ai/claude-agent-sdk";
import { InvalidOperationError, Operation } from "@esposter/shared";
// Claude Code sessions through the Claude Agent SDK. Sessions are the terminal's own — written where the terminal
// Writes them, with the terminal's settings — so `claude --resume <id>` picks up a session started here and back.
export const createClaudeAgentSdkDriver = ({ onEvents, onSessionOpen, onSessionsChange }: DriverCallbacks): Driver => {
  const openSessionMap = new Map<string, OpenSession>();
  const taskRegistry = createTaskRegistry();

  const emit = (sessionId: string, events: AgentEvent[]) => {
    const openSession = openSessionMap.get(sessionId);
    let isStateChanged = false;

    if (openSession) {
      openSession.lastActivityAt = new Date();
      for (const event of events)
        if (event.type === AgentEventType.SessionState && event.state !== openSession.state) {
          openSession.state = event.state;
          isStateChanged = true;
        }
    }

    onEvents(sessionId, events);
    if (isStateChanged) onSessionsChange();
  };

  const getOpenSession = (sessionId: string) => {
    const openSession = openSessionMap.get(sessionId);
    if (!openSession)
      throw new InvalidOperationError(Operation.Read, sessionId, "the session is not open on this host");
    return openSession;
  };

  const openSessionQuery = createSessionOpener({ emit, onSessionOpen, onSessionsChange, openSessionMap, taskRegistry });

  const closeSession = (sessionId: string) => {
    const closingSession = getOpenSession(sessionId);
    closeOpenSession(sessionId, closingSession, "", { emit, onSessionsChange, openSessionMap });
    closingSession.input.close();
    closingSession.query.close();
  };

  const prompt = (sessionId: string, text: string, attachments: Attachment[]) => {
    const openSession = getOpenSession(sessionId);
    const uuid = crypto.randomUUID();
    const createdAt = new Date();
    openSession.input.push({
      message: {
        content: [...attachments.map((attachment) => toContentBlockParam(attachment)), { text, type: "text" }],
        role: "user",
      },
      parent_tool_use_id: null,
      type: "user",
      uuid,
    });
    openSession.title ||= text;
    // The SDK does not echo a prompt back, so the host reports it — under the uuid the transcript records it by,
    // Which is what a fork or a rewind to this message names
    emit(sessionId, [
      {
        attachmentCount: attachments.length,
        createdAt,
        id: uuid,
        messageUuid: uuid,
        parentToolUseId: "",
        text,
        type: AgentEventType.UserMessage,
      },
      {
        createdAt,
        id: getEventId(uuid, AgentEventType.SessionState),
        state: SessionState.Running,
        type: AgentEventType.SessionState,
      },
    ]);
  };

  const resumeSession = async (sessionId: string) => {
    if (openSessionMap.has(sessionId)) return sessionId;
    const cwd = await readSessionCwd(sessionId);
    return openSessionQuery({ cwd, isFork: false, resumeAt: "", resumeFrom: sessionId, sessionId });
  };

  return {
    close: async () => {
      for (const sessionId of openSessionMap.keys()) closeSession(sessionId);
      await taskRegistry.drain();
    },
    closeSession,
    createSession: (cwd) =>
      openSessionQuery({ cwd, isFork: false, resumeAt: "", resumeFrom: "", sessionId: crypto.randomUUID() }),
    forkSession: async (sessionId, messageUuid) => {
      const cwd = await readSessionCwd(sessionId);
      return openSessionQuery({
        cwd,
        isFork: true,
        resumeAt: messageUuid,
        resumeFrom: sessionId,
        sessionId: crypto.randomUUID(),
      });
    },
    interrupt: async (sessionId) => {
      await getOpenSession(sessionId).query.interrupt();
    },
    listSessions: async () => {
      const sessionInfos = await listSessions({ limit: SESSION_LIST_LIMIT });
      const savedSessionIds = new Set(sessionInfos.map(({ sessionId }) => sessionId));
      // A session opened here but not yet prompted has no transcript on disk, and is listed all the same
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
    },
    prompt,
    // A request no longer pending was answered from another tab or abandoned by the SDK; the verdict has
    // Nothing left to settle
    resolvePermission: (sessionId, requestId, behavior, message) => {
      getOpenSession(sessionId).pendingPermissionMap.get(requestId)?.settle(behavior, message);
    },
    resumeAt: async (sessionId, messageUuid) => {
      const cwd = await readSessionCwd(sessionId);
      if (openSessionMap.has(sessionId)) closeSession(sessionId);
      return openSessionQuery({ cwd, isFork: false, resumeAt: messageUuid, resumeFrom: sessionId, sessionId });
    },
    resumeSession,
    // The checkpoints are the session's, kept on disk beside its transcript, so a closed session is resumed to reach
    // Them. The SDK counts what a rewind changes only on a dry run, so one runs first; a rewind the SDK refuses fails
    // The command with its reason, and the files stay as they are
    rewindFiles: async (sessionId, messageUuid) => {
      await resumeSession(sessionId);
      const { query } = getOpenSession(sessionId);
      const { canRewind, deletions, error, filesChanged, insertions } = await query.rewindFiles(messageUuid, {
        dryRun: true,
      });
      if (!canRewind) throw new InvalidOperationError(Operation.Update, sessionId, error ?? "nothing to rewind");
      const rewindResult = await query.rewindFiles(messageUuid);
      if (rewindResult.error) throw new InvalidOperationError(Operation.Update, sessionId, rewindResult.error);
      emit(sessionId, [
        {
          createdAt: new Date(),
          deletions: deletions ?? 0,
          filePaths: filesChanged ?? [],
          id: crypto.randomUUID(),
          insertions: insertions ?? 0,
          messageUuid,
          type: AgentEventType.FileRewind,
        },
      ]);
    },
    // The SDK runs a slash command written into the prompt, exactly as the terminal's input line does
    runSlashCommand: (sessionId, name, commandArguments) => {
      prompt(sessionId, commandArguments ? `/${name} ${commandArguments}` : `/${name}`, []);
    },
    setModel: async (sessionId, model) => {
      const { mapper, query } = getOpenSession(sessionId);
      await query.setModel(model);
      emit(sessionId, [mapper.updateSettings(crypto.randomUUID(), new Date(), { model })]);
    },
    setPermissionMode: async (sessionId, permissionMode) => {
      const { mapper, query } = getOpenSession(sessionId);
      await query.setPermissionMode(permissionMode);
      emit(sessionId, [mapper.updateSettings(crypto.randomUUID(), new Date(), { permissionMode })]);
    },
  };
};
