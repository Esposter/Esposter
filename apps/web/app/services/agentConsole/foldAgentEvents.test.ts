import { MAIN_LANE_TITLE } from "@/services/agentConsole/constants";
import { createSessionView } from "@/services/agentConsole/createSessionView";
import { foldAgentEvents } from "@/services/agentConsole/foldAgentEvents";
import { readRecordedEvents } from "@/services/agentConsole/readRecordedEvents.test";
import { AgentEventType, SubagentStatus } from "agent-console-server/contracts";
import { describe, expect, test } from "vitest";

describe(foldAgentEvents, () => {
  const events = readRecordedEvents();

  test("folds each event once however often the log arrives, into every view the page reads", () => {
    expect.hasAssertions();

    const sessionView = createSessionView();
    const firstAddedEvents = foldAgentEvents(sessionView, events);
    const replayedAddedEvents = foldAgentEvents(sessionView, events);

    expect(firstAddedEvents).toStrictEqual(events);
    expect(replayedAddedEvents).toStrictEqual([]);
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
          ["Write", true],
          ["Bash", true],
          ["Read", true],
          ["Agent", true],
        ],
      },
      { status: SubagentStatus.Completed, title: "List files via Glob", toolCalls: [["Glob", true]] },
    ]);
    expect(
      [...sessionView.fileEditMap.values()]
        .flat()
        .map(({ filePath, newText, oldText }) => ({ filePath, newText, oldText })),
    ).toStrictEqual([{ filePath: "/a", newText: "a", oldText: "" }]);
    expect(Array.from(sessionView.pendingPermissionRequestMap.values(), ({ toolName }) => toolName)).toStrictEqual([
      "Write",
    ]);
    expect(sessionView.latestEventMap[AgentEventType.TurnResult]).toStrictEqual(
      events.findLast((event) => event.type === AgentEventType.TurnResult),
    );
    expect(sessionView.conversationEvents.map(({ type }) => type)).toMatchInlineSnapshot(`
      [
        "Hook",
        "Hook",
        "Thinking",
        "ToolUse",
        "ToolUse",
        "ToolUse",
        "Unknown",
        "Unknown",
        "Thinking",
        "Hook",
        "Hook",
        "AssistantMessage",
        "TurnResult",
        "ToolUse",
        "Hook",
        "Hook",
        "AssistantMessage",
        "TurnResult",
      ]
    `);
  });
});
