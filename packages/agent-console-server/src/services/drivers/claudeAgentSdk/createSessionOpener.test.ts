import { createSessionOpener } from "#src/services/drivers/claudeAgentSdk/createSessionOpener";
import { watchSession } from "#src/services/drivers/claudeAgentSdk/watchSession";
import { createTaskRegistry } from "#src/services/shared/createTaskRegistry";
import { getSessionMessages, query } from "@anthropic-ai/claude-agent-sdk";
import { takeOne } from "@esposter/shared";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@anthropic-ai/claude-agent-sdk"), () => ({
  getSessionMessages: vi.fn<typeof getSessionMessages>(),
  query: vi.fn<typeof query>(),
}));
vi.mock(import("#src/services/drivers/claudeAgentSdk/watchSession"), () => ({
  watchSession: vi.fn<typeof watchSession>(),
}));

describe(createSessionOpener, () => {
  const cwd = "/repo";
  const sessionId = crypto.randomUUID();
  const forkedSessionId = crypto.randomUUID();
  const openSideChat = (isSideChat: boolean) =>
    createSessionOpener({
      emit: vi.fn<(sessionId: string, events: unknown[]) => void>(),
      onSessionOpen: vi.fn<(sessionId: string) => void>(),
      onSessionsChange: vi.fn<() => void>(),
      openSessionMap: new Map(),
      taskRegistry: createTaskRegistry(),
    })({ cwd, isFork: true, isSideChat, resumeAt: "", resumeFrom: sessionId, sessionId: forkedSessionId });
  const readQueryOptions = () => {
    const [{ options }] = takeOne(vi.mocked(query).mock.calls);
    return options;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSessionMessages).mockResolvedValue([]);
    vi.mocked(watchSession).mockResolvedValue(undefined);
  });

  test("A closed side chat leaves no saved session", async () => {
    expect.hasAssertions();

    await openSideChat(true);

    expect(readQueryOptions()?.persistSession).toBe(false);
  });

  test("The first question is answered with the conversation as context", async () => {
    expect.hasAssertions();

    await openSideChat(true);

    expect(readQueryOptions()?.forkSession).toBe(true);
    expect(readQueryOptions()?.resume).toBe(sessionId);
    expect(readQueryOptions()?.resumeSessionAt).toBeUndefined();
  });

  test("A side chat question cannot become edits", async () => {
    expect.hasAssertions();

    await openSideChat(true);

    expect(readQueryOptions()?.permissionMode).toBe("plan");
  });
});
