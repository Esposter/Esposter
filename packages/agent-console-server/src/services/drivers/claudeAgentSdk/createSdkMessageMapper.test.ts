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

describe(createSdkMessageMapper, () => {
  // One real session through the SDK — a permission prompt, a file write, a Bash call, a subagent, the persona's
  // Hooks — recorded once and checked in, so no test here ever makes a live call
  // oxlint-disable-next-line no-restricted-properties -- the SDK's own JSON, read as the SDK hands it over: its timestamps stay strings
  const recordedSession = JSON.parse(
    readFileSync(resolve(import.meta.dirname, "recordedSession.json"), "utf8"),
  ) as RecordedSession;
  const createdAt = new Date(0);

  test("maps the recorded session to events the wire contract accepts", async () => {
    expect.hasAssertions();

    const { mapMessage } = createSdkMessageMapper();
    const permissionRequest = takeOne(recordedSession.permissionRequests);
    // The whole session as the page receives it, which the app's store and visual tests replay
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
    const thinkingTokensMessage = recordedSession.messages.find(
      (message) => message.type === "system" && message.subtype === "thinking_tokens",
    );
    assert.exists(thinkingTokensMessage);

    expect(mapMessage(thinkingTokensMessage, createdAt)).toStrictEqual([
      {
        createdAt,
        id: thinkingTokensMessage.uuid,
        raw: JSON.stringify(thinkingTokensMessage),
        sdkType: "system:thinking_tokens",
        type: AgentEventType.Unknown,
      },
    ]);
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
