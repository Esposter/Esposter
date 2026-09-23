import type { FileRewindEvent, HookEvent, UserMessageEvent } from "agent-console-server/contracts";

import { MAIN_LANE_TITLE, SESSION_START_HOOK_EVENT } from "@/services/agentConsole/constants";
import { createSessionView } from "@/services/agentConsole/createSessionView";
import { foldAgentEvents } from "@/services/agentConsole/foldAgentEvents";
import { readRecordedEvents } from "@/services/agentConsole/readRecordedEvents.test";
import {
  AgentEventType,
  EphemeralAgentEventTypes,
  HookPhase,
  SessionState,
  SubagentStatus,
} from "agent-console-server/contracts";
import { describe, expect, test } from "vitest";

describe(foldAgentEvents, () => {
  const events = readRecordedEvents();

  test("folds each event once however often the log arrives, into every view the page reads", () => {
    expect.hasAssertions();

    const sessionView = createSessionView();
    const firstAddedEvents = foldAgentEvents(sessionView, events);
    const replayedAddedEvents = foldAgentEvents(sessionView, events);

    expect(firstAddedEvents).toStrictEqual(events);
    // The host never replays an ephemeral event, so only a replay of the recording itself folds one twice
    expect(replayedAddedEvents).toStrictEqual(events.filter(({ type }) => EphemeralAgentEventTypes.includes(type)));
    expect(
      Array.from(sessionView.timelineLaneMap.values(), ({ status, title, toolCalls }) => ({
        status,
        title,
        toolCalls: toolCalls.map(({ result, toolUse }) => [toolUse.name, Boolean(result)]),
      })),
    ).toStrictEqual([
      {
        status: undefined,
        title: MAIN_LANE_TITLE,
        toolCalls: [
          ["ToolSearch", true],
          ["TaskCreate", true],
          ["TaskCreate", true],
          ["Write", true],
          ["Edit", true],
          ["TaskUpdate", true],
          ["TaskUpdate", true],
          ["Bash", true],
          ["Agent", true],
        ],
      },
      { status: SubagentStatus.Completed, title: "Read notes.txt line", toolCalls: [["Read", true]] },
    ]);
    expect(
      [...sessionView.fileEditMap.values()]
        .flat()
        .map(({ filePath, newText, oldText }) => ({ filePath, newText, oldText })),
    ).toStrictEqual([
      { filePath: String.raw`/a\notes.txt`, newText: "one\n", oldText: "" },
      { filePath: String.raw`/a\notes.txt`, newText: "two", oldText: "one" },
    ]);
    expect([...sessionView.fileOriginMap]).toStrictEqual([[String.raw`/a\notes.txt`, ""]]);
    expect(Array.from(sessionView.pendingPermissionRequestMap.values(), ({ toolName }) => toolName)).toStrictEqual([
      "Write",
    ]);
    expect(sessionView.latestEventMap[AgentEventType.TurnResult]).toStrictEqual(
      events.findLast((event) => event.type === AgentEventType.TurnResult),
    );
    expect(sessionView.conversationEvents.map(({ type }) => type)).toMatchInlineSnapshot(`
      [
        "Thinking",
        "Hook",
        "Hook",
        "AssistantMessage",
        "ToolUse",
        "ToolUse",
        "ToolUse",
        "Hook",
        "Hook",
        "AssistantMessage",
        "ToolUse",
        "Hook",
        "Hook",
        "AssistantMessage",
        "ToolUse",
        "Hook",
        "Hook",
        "AssistantMessage",
        "ToolUse",
        "ToolUse",
        "Hook",
        "Hook",
        "AssistantMessage",
        "ToolUse",
        "Hook",
        "Hook",
        "AssistantMessage",
        "ToolUse",
        "Hook",
        "Hook",
        "AssistantMessage",
        "TurnResult",
      ]
    `);
  });

  test("builds the block being written from its pieces until the whole block or the turn's end replaces it", () => {
    expect.hasAssertions();

    const sessionView = createSessionView();
    const createdAt = new Date(0);
    const blockId = " ";

    foldAgentEvents(sessionView, [
      { blockId, createdAt, id: "a", isThinking: false, text: "a", type: AgentEventType.StreamDelta },
      { blockId, createdAt, id: "b", isThinking: false, text: "b", type: AgentEventType.StreamDelta },
    ]);

    expect(sessionView.streamDraft).toStrictEqual({ blockId, isThinking: false, text: "ab" });

    foldAgentEvents(sessionView, [
      { createdAt, id: "c", messageUuid: "", parentToolUseId: "", text: "ab", type: AgentEventType.AssistantMessage },
    ]);

    expect(sessionView.streamDraft).toBeUndefined();

    foldAgentEvents(sessionView, [
      { blockId, createdAt, id: "d", isThinking: true, text: "a", type: AgentEventType.StreamDelta },
      { createdAt, id: "e", state: SessionState.Idle, type: AgentEventType.SessionState },
    ]);

    expect(sessionView.streamDraft).toBeUndefined();
  });

  test("keeps the context a session-start hook added once it has responded", () => {
    expect.hasAssertions();

    const sessionView = createSessionView();
    const additionalContext = "additionalContext";
    const toHookEvent = (phase: HookPhase): HookEvent => ({
      createdAt: new Date(0),
      exitCode: 0,
      hookEvent: SESSION_START_HOOK_EVENT,
      hookId: " ",
      hookName: "",
      id: crypto.randomUUID(),
      outcome: "",
      output: "",
      phase,
      stderr: "",
      stdout: JSON.stringify({ hookSpecificOutput: { additionalContext } }),
      type: AgentEventType.Hook,
    });

    foldAgentEvents(sessionView, [...events, toHookEvent(HookPhase.Started), toHookEvent(HookPhase.Response)]);

    expect(sessionView.sessionStartContexts).toStrictEqual([additionalContext]);
  });

  test("undoes the file changes made from the prompt the files were rewound to on", () => {
    expect.hasAssertions();

    const messageUuid = " ";
    const rewindEvent: FileRewindEvent = {
      createdAt: new Date(0),
      deletions: 0,
      filePaths: [],
      id: crypto.randomUUID(),
      insertions: 0,
      messageUuid,
      type: AgentEventType.FileRewind,
    };
    const toUserMessageEvent = (createdAt: Date): UserMessageEvent => ({
      attachmentCount: 0,
      createdAt,
      id: crypto.randomUUID(),
      messageUuid,
      parentToolUseId: "",
      text: "",
      type: AgentEventType.UserMessage,
    });
    const laterSessionView = createSessionView();
    const earlierSessionView = createSessionView();

    foldAgentEvents(laterSessionView, [...events, toUserMessageEvent(new Date(1)), rewindEvent]);
    foldAgentEvents(earlierSessionView, [...events, toUserMessageEvent(new Date(0)), rewindEvent]);

    expect(laterSessionView.fileEditMap.size).toBe(2);
    expect(earlierSessionView.fileEditMap.size).toBe(0);
  });
});
