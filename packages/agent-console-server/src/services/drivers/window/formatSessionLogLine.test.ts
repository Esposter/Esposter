import type { AgentEvent } from "#src/models/event/AgentEvent";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { SessionState } from "#src/models/session/SessionState";
import { formatSessionLogLine } from "#src/services/drivers/window/formatSessionLogLine";
import { describe, expect, test } from "vitest";

describe(formatSessionLogLine, () => {
  const createdAt = new Date(0);
  const message = { createdAt, id: " ", messageUuid: " ", text: " " };

  test.each<[AgentEvent, string]>([
    [{ ...message, attachmentCount: 0, parentToolUseId: "", type: AgentEventType.UserMessage }, "You:  "],
    [{ ...message, parentToolUseId: "", type: AgentEventType.AssistantMessage }, "Claude:  "],
    // A subagent's own conversation is left to the page
    [{ ...message, parentToolUseId: " ", type: AgentEventType.AssistantMessage }, ""],
    [
      {
        createdAt,
        id: " ",
        input: {},
        messageUuid: " ",
        name: " ",
        parentToolUseId: "",
        toolUseId: " ",
        type: AgentEventType.ToolUse,
      },
      "Claude uses  ",
    ],
    [
      {
        blockedPath: "",
        createdAt,
        decisionReason: "",
        hasSuggestions: false,
        id: " ",
        input: {},
        requestId: " ",
        title: "",
        toolName: " ",
        toolUseId: " ",
        type: AgentEventType.PermissionRequest,
      },
      "Claude asks to use  . Answer in the page.",
    ],
    [{ createdAt, id: " ", message: " ", type: AgentEventType.HostError }, "Error:  "],
    [{ createdAt, id: " ", state: SessionState.Idle, type: AgentEventType.SessionState }, ""],
  ])("prints %j as %j", (event, expected) => {
    expect.hasAssertions();

    expect(formatSessionLogLine(event)).toBe(expected);
  });
});
