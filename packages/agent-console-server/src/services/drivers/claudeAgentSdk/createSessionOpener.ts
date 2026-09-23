import type { OpenSession } from "#src/models/claudeAgentSdk/OpenSession";
import type { OpenSessionOptions } from "#src/models/claudeAgentSdk/OpenSessionOptions";
import type { SessionOpenerContext } from "#src/models/claudeAgentSdk/SessionOpenerContext";
import type { SDKUserMessage } from "@anthropic-ai/claude-agent-sdk";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { SessionState } from "#src/models/session/SessionState";
import { SETTING_SOURCES } from "#src/services/drivers/claudeAgentSdk/constants";
import { createInputQueue } from "#src/services/drivers/claudeAgentSdk/createInputQueue";
import { createPermissionBridge } from "#src/services/drivers/claudeAgentSdk/createPermissionBridge";
import { createSdkMessageMapper } from "#src/services/drivers/claudeAgentSdk/createSdkMessageMapper";
import { getEventId } from "#src/services/drivers/claudeAgentSdk/getEventId";
import { readSessionHistory } from "#src/services/drivers/claudeAgentSdk/readSessionHistory";
import { readToolUseResultMap } from "#src/services/drivers/claudeAgentSdk/readToolUseResultMap";
import { watchSession } from "#src/services/drivers/claudeAgentSdk/watchSession";
import { query } from "@anthropic-ai/claude-agent-sdk";
// One streaming-input query per open session, kept open across turns. A resumed or forked session first replays
// Its transcript, so the page shows the conversation it is continuing exactly as `claude --resume` would.
export const createSessionOpener =
  ({ emit, onSessionOpen, onSessionsChange, openSessionMap, taskRegistry }: SessionOpenerContext) =>
  async ({ cwd, isFork, resumeAt, resumeFrom, sessionId }: OpenSessionOptions): Promise<string> => {
    const mapper = createSdkMessageMapper();
    const history = resumeFrom ? await readSessionHistory(resumeFrom, cwd, resumeAt) : [];
    const toolUseResultMap = resumeFrom ? await readToolUseResultMap(resumeFrom) : new Map<string, unknown>();
    const input = createInputQueue<SDKUserMessage>();
    const pendingPermissionMap: OpenSession["pendingPermissionMap"] = new Map();
    const sessionQuery = query({
      options: {
        canUseTool: createPermissionBridge(sessionId, pendingPermissionMap, emit),
        cwd,
        // Checkpoints every file before an edit, as the terminal does, so a rewind can put the files back too
        enableFileCheckpointing: true,
        // The SDK replaces the whole environment with the one given. The task tools behind the checklist are the
        // Terminal's, and an SDK session is given them only when asked
        env: { ...process.env, CLAUDE_CODE_ENABLE_TODO_TOOLS: "true" },
        includeHookEvents: true,
        // The reply as the model writes it, rather than a block at a time once each is whole
        includePartialMessages: true,
        settingSources: SETTING_SOURCES,
        systemPrompt: { preset: "claude_code", type: "preset" },
        // Summarized rather than the SDK's default of omitted, which streams every thinking block empty
        thinking: { display: "summarized", type: "adaptive" },
        ...(resumeFrom ? { resume: resumeFrom } : {}),
        ...(resumeAt ? { resumeSessionAt: resumeAt } : {}),
        // A new session or a fork takes the id the host chose; a resumed one keeps its own
        ...(!resumeFrom || isFork ? { forkSession: isFork, sessionId } : {}),
      },
      prompt: input.iterable,
    });
    const openSession: OpenSession = {
      cwd,
      input,
      lastActivityAt: new Date(),
      mapper,
      pendingPermissionMap,
      query: sessionQuery,
      state: SessionState.Idle,
      title: "",
    };

    onSessionOpen(sessionId);
    openSessionMap.set(sessionId, openSession);
    const createdAt = new Date();
    emit(sessionId, [
      ...history.flatMap((sessionMessage) =>
        mapper.mapHistory(sessionMessage, createdAt, toolUseResultMap.get(sessionMessage.uuid)),
      ),
      {
        createdAt,
        id: getEventId(crypto.randomUUID(), AgentEventType.SessionState),
        state: SessionState.Idle,
        type: AgentEventType.SessionState,
      },
    ]);
    onSessionsChange();
    taskRegistry.run(() => watchSession(sessionId, openSession, { emit, onSessionsChange, openSessionMap }));
    return sessionId;
  };
