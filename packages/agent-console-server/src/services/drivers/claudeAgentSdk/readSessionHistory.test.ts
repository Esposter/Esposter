import type { SessionMessage } from "@anthropic-ai/claude-agent-sdk";

import { readSessionHistory } from "#src/services/drivers/claudeAgentSdk/readSessionHistory";
import { getSessionMessages } from "@anthropic-ai/claude-agent-sdk";
import { InvalidOperationError } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@anthropic-ai/claude-agent-sdk"), () => ({ getSessionMessages: vi.fn() }));

describe(readSessionHistory, () => {
  const sessionId = crypto.randomUUID();
  const createSessionMessage = (): SessionMessage => ({
    message: {},
    parent_agent_id: null,
    parent_tool_use_id: null,
    session_id: sessionId,
    type: "user",
    uuid: crypto.randomUUID(),
  });
  const resumeAtMessage = createSessionMessage();
  const sessionMessages = [createSessionMessage(), resumeAtMessage, createSessionMessage()];

  test("reads the transcript up to and including the message it is resumed at", async () => {
    expect.hasAssertions();

    vi.mocked(getSessionMessages).mockResolvedValue(sessionMessages);

    await expect(readSessionHistory(sessionId, "", resumeAtMessage.uuid)).resolves.toStrictEqual(
      sessionMessages.slice(0, 2),
    );
    await expect(readSessionHistory(sessionId, "", "")).resolves.toStrictEqual(sessionMessages);
  });

  test("refuses a message the transcript does not hold", async () => {
    expect.hasAssertions();

    vi.mocked(getSessionMessages).mockResolvedValue(sessionMessages);

    await expect(readSessionHistory(sessionId, "", crypto.randomUUID())).rejects.toThrow(InvalidOperationError);
  });
});
