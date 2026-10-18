import { SessionState } from "#src/models/session/SessionState";
import { listSessionSummaries } from "#src/services/drivers/claudeAgentSdk/listSessionSummaries";
import { listSessions } from "@anthropic-ai/claude-agent-sdk";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@anthropic-ai/claude-agent-sdk"), () => ({ listSessions: vi.fn<typeof listSessions>() }));

describe(listSessionSummaries, () => {
  const cwd = "/repo";
  const lastActivityAt = new Date(0);

  test("An open side chat is hidden from the sessions list", async () => {
    expect.hasAssertions();

    vi.mocked(listSessions).mockResolvedValue([]);
    const sessionId = crypto.randomUUID();
    const sideChatId = crypto.randomUUID();

    await expect(
      listSessionSummaries(
        new Map([
          [sessionId, { cwd, isSideChat: false, lastActivityAt, state: SessionState.Idle, title: "" }],
          [sideChatId, { cwd, isSideChat: true, lastActivityAt, state: SessionState.Idle, title: "" }],
        ]),
      ),
    ).resolves.toStrictEqual([{ cwd, id: sessionId, lastActivityAt, state: SessionState.Idle, title: "" }]);
  });
});
