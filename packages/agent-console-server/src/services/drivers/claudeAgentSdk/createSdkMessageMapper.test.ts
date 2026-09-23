import type {
  CanUseTool,
  ModelInfo,
  SDKControlGetContextUsageResponse,
  SDKMessage,
  SlashCommand,
} from "@anthropic-ai/claude-agent-sdk";

import { agentEventSchema } from "#src/models/event/AgentEvent";
import { AgentEventType } from "#src/models/event/AgentEventType";
import { TodoStatus } from "#src/models/event/TodoStatus";
import { createSdkMessageMapper } from "#src/services/drivers/claudeAgentSdk/createSdkMessageMapper";
import { getEventId } from "#src/services/drivers/claudeAgentSdk/getEventId";
import { toCapabilitiesEvent } from "#src/services/drivers/claudeAgentSdk/toCapabilitiesEvent";
import { toContextUsageEvent } from "#src/services/drivers/claudeAgentSdk/toContextUsageEvent";
import { toPermissionRequestEvent } from "#src/services/drivers/claudeAgentSdk/toPermissionRequestEvent";
import { takeOne } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { assert, describe, expect, test } from "vitest";

interface RecordedSession {
  commands: SlashCommand[];
  contextUsage: Pick<
    SDKControlGetContextUsageResponse,
    "autoCompactThreshold" | "isAutoCompactEnabled" | "maxTokens" | "percentage" | "totalTokens"
  >;
  messages: SDKMessage[];
  models: ModelInfo[];
  permissionRequests: {
    input: Record<string, unknown>;
    options: Parameters<CanUseTool>[2];
    toolName: string;
  }[];
}

const toStreamMessage = (
  event: Extract<SDKMessage, { type: "stream_event" }>["event"],
  parentToolUseId: null | string,
): SDKMessage => ({
  event,
  parent_tool_use_id: parentToolUseId,
  session_id: "",
  type: "stream_event",
  uuid: crypto.randomUUID(),
});

describe(createSdkMessageMapper, () => {
  // One real session through the SDK — a task list, a file written then edited behind two permission prompts, a Bash
  // Call, a subagent, the reply streamed as written with its thinking counted, the persona's hooks — recorded once and
  // Checked in, so no test here ever makes a live call
  // oxlint-disable-next-line no-restricted-properties -- the SDK's own JSON, read as the SDK hands it over: its timestamps stay strings
  const recordedSession = JSON.parse(
    readFileSync(resolve(import.meta.dirname, "recordedSession.json"), "utf8"),
  ) as RecordedSession;
  const createdAt = new Date(0);

  test("maps the recorded session to events the wire contract accepts", async () => {
    expect.hasAssertions();

    const { mapMessage } = createSdkMessageMapper();
    const permissionRequest = takeOne(recordedSession.permissionRequests);
    // The whole session as the page receives it, which the app's fold and world tests replay
    const events = [
      ...recordedSession.messages.flatMap((message) => mapMessage(message, createdAt)),
      toCapabilitiesEvent("a", recordedSession.commands, recordedSession.models, createdAt),
      toContextUsageEvent("b", recordedSession.contextUsage, createdAt),
      toPermissionRequestEvent(
        permissionRequest.toolName,
        permissionRequest.input,
        permissionRequest.options,
        createdAt,
      ),
    ];

    expect(events.map((event) => agentEventSchema.parse(event))).toStrictEqual(events);
    await expect(`${JSON.stringify(events, null, 2)}\n`).toMatchFileSnapshot(
      "__snapshots__/recordedSession.events.json",
    );
  });

  test("keeps a message the contract has no event for as a raw row", () => {
    expect.hasAssertions();

    const { mapMessage } = createSdkMessageMapper();
    const promptSuggestionMessage: SDKMessage = {
      session_id: "",
      suggestion: "",
      type: "prompt_suggestion",
      uuid: crypto.randomUUID(),
    };

    expect(mapMessage(promptSuggestionMessage, createdAt)).toStrictEqual([
      {
        createdAt,
        id: promptSuggestionMessage.uuid,
        raw: JSON.stringify(promptSuggestionMessage),
        sdkType: "prompt_suggestion",
        type: AgentEventType.Unknown,
      },
    ]);
  });

  test("streams the main agent's reply and counts the tokens its turn has written", () => {
    expect.hasAssertions();

    const { mapMessage } = createSdkMessageMapper();
    const thinkingTokensMessage = recordedSession.messages.find(
      (message) => message.type === "system" && message.subtype === "thinking_tokens",
    );
    const resultMessage = recordedSession.messages.find((message) => message.type === "result");
    assert.exists(thinkingTokensMessage);
    assert(thinkingTokensMessage.type === "system" && thinkingTokensMessage.subtype === "thinking_tokens");
    assert.exists(resultMessage);
    const textDeltaMessage = toStreamMessage(
      { delta: { text: "a", type: "text_delta" }, index: 0, type: "content_block_delta" },
      null,
    );
    const messageDeltaMessage = toStreamMessage(
      {
        context_management: null,
        delta: { container: null, stop_details: null, stop_reason: null, stop_sequence: null },
        type: "message_delta",
        usage: {
          cache_creation_input_tokens: null,
          cache_read_input_tokens: null,
          fallback_credit: null,
          input_tokens: null,
          iterations: null,
          output_tokens: 1,
          output_tokens_details: null,
          server_tool_use: null,
        },
      },
      null,
    );
    const readOutputTokens = (message: SDKMessage) =>
      mapMessage(message, createdAt).flatMap((event) =>
        event.type === AgentEventType.TurnUsage ? [event.outputTokens] : [],
      );

    expect(mapMessage(textDeltaMessage, createdAt)).toStrictEqual([
      {
        blockId: getEventId("", 0),
        createdAt,
        id: textDeltaMessage.uuid,
        isThinking: false,
        text: "a",
        type: AgentEventType.StreamDelta,
      },
    ]);
    expect(
      mapMessage(
        toStreamMessage({ delta: { text: "a", type: "text_delta" }, index: 0, type: "content_block_delta" }, " "),
        createdAt,
      ),
    ).toStrictEqual([]);
    expect(readOutputTokens(messageDeltaMessage)).toStrictEqual([1]);
    expect(readOutputTokens(thinkingTokensMessage)).toStrictEqual([1 + thinkingTokensMessage.estimated_tokens]);

    mapMessage(resultMessage, createdAt);

    expect(readOutputTokens(messageDeltaMessage)).toStrictEqual([1]);
  });

  test("carries a file's text before the session changed it on its first change alone", () => {
    expect.hasAssertions();

    const { mapMessage } = createSdkMessageMapper();
    const writeResultMessage = recordedSession.messages.find(
      (message) =>
        message.type === "user" &&
        typeof message.tool_use_result === "object" &&
        message.tool_use_result !== null &&
        "filePath" in message.tool_use_result,
    );
    assert.exists(writeResultMessage);
    const readOriginalTexts = () =>
      mapMessage(writeResultMessage, createdAt).flatMap((event) =>
        event.type === AgentEventType.ToolResult ? [event.originalText] : [],
      );

    expect(readOriginalTexts()).toStrictEqual([""]);
    expect(readOriginalTexts()).toStrictEqual([undefined]);
  });

  test("carries a file's text before the session changed it from a transcript read back on resume", () => {
    expect.hasAssertions();

    const { mapHistory } = createSdkMessageMapper();
    const writeResultMessage = recordedSession.messages.find(
      (message) =>
        message.type === "user" &&
        typeof message.tool_use_result === "object" &&
        message.tool_use_result !== null &&
        "filePath" in message.tool_use_result,
    );
    assert.exists(writeResultMessage);
    assert(writeResultMessage.type === "user");
    const { message, parent_tool_use_id, tool_use_result, uuid = "" } = writeResultMessage;
    const originalTexts = mapHistory(
      { message, parent_agent_id: null, parent_tool_use_id, session_id: "", type: "user", uuid },
      createdAt,
      tool_use_result,
    ).flatMap((event) => (event.type === AgentEventType.ToolResult ? [event.originalText] : []));

    expect(originalTexts).toStrictEqual([""]);
  });

  test("rebuilds the checklist from TodoWrite and from the task tools", () => {
    expect.hasAssertions();

    const { mapMessage } = createSdkMessageMapper();
    const toolUseMessage = recordedSession.messages.find((message) => message.type === "assistant");
    assert.exists(toolUseMessage);
    assert(toolUseMessage.type === "assistant");
    const withToolUse = (id: string, name: string, input: Record<string, unknown>): SDKMessage => ({
      ...toolUseMessage,
      message: {
        ...toolUseMessage.message,
        content: [{ caller: { type: "direct" }, id, input, name, type: "tool_use" }],
      },
      uuid: crypto.randomUUID(),
    });
    const todoWriteMessage = withToolUse(" ", "TodoWrite", {
      todos: [{ activeForm: "", content: "", status: TodoStatus.InProgress }],
    });
    const taskCreateMessage = withToolUse("a", "TaskCreate", { subject: "" });
    const taskResultMessage: SDKMessage = {
      message: { content: [{ content: "", tool_use_id: "a", type: "tool_result" }], role: "user" },
      parent_tool_use_id: null,
      tool_use_result: { task: { id: "b", subject: "" } },
      type: "user",
      uuid: crypto.randomUUID(),
    };
    const taskUpdateMessage = withToolUse("c", "TaskUpdate", { status: TodoStatus.Completed, taskId: "b" });
    const readTodos = (message: SDKMessage) =>
      mapMessage(message, createdAt).flatMap((event) =>
        event.type === AgentEventType.TodoUpdate ? [event.todos] : [],
      );

    expect(readTodos(todoWriteMessage)).toStrictEqual([
      [{ activeForm: "", content: "", id: "0", status: TodoStatus.InProgress }],
    ]);
    expect(readTodos(taskCreateMessage)).toStrictEqual([]);
    expect(readTodos(taskResultMessage)).toStrictEqual([
      [
        { activeForm: "", content: "", id: "0", status: TodoStatus.InProgress },
        { activeForm: "", content: "", id: "b", status: TodoStatus.Pending },
      ],
    ]);
    expect(readTodos(taskUpdateMessage)).toStrictEqual([
      [
        { activeForm: "", content: "", id: "0", status: TodoStatus.InProgress },
        { activeForm: "", content: "", id: "b", status: TodoStatus.Completed },
      ],
    ]);
  });
});
