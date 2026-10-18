import type { DriverCallbacks } from "#src/models/driver/DriverCallbacks";
import type { Query } from "@anthropic-ai/claude-agent-sdk";

import { PermissionMode } from "#src/models/session/PermissionMode";
import { createClaudeAgentSdkDriver } from "#src/services/drivers/claudeAgentSdk/createClaudeAgentSdkDriver";
import { readSessionCwd } from "#src/services/drivers/claudeAgentSdk/readSessionCwd";
import { watchSession } from "#src/services/drivers/claudeAgentSdk/watchSession";
import { getSessionMessages, query } from "@anthropic-ai/claude-agent-sdk";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@anthropic-ai/claude-agent-sdk"), () => ({
  getSessionMessages: vi.fn<typeof getSessionMessages>(),
  query: vi.fn<typeof query>(),
}));
vi.mock(import("#src/services/drivers/claudeAgentSdk/readSessionCwd"), () => ({
  readSessionCwd: vi.fn<typeof readSessionCwd>(),
}));
vi.mock(import("#src/services/drivers/claudeAgentSdk/watchSession"), () => ({
  watchSession: vi.fn<typeof watchSession>(),
}));

describe(createClaudeAgentSdkDriver, () => {
  const cwd = "/repo";
  const sessionId = crypto.randomUUID();
  const setPermissionMode = vi.fn<Query["setPermissionMode"]>();
  const createDriver = () => {
    const callbacks: DriverCallbacks = {
      onEvents: vi.fn<DriverCallbacks["onEvents"]>(),
      onSessionOpen: vi.fn<DriverCallbacks["onSessionOpen"]>(),
      onSessionsChange: vi.fn<DriverCallbacks["onSessionsChange"]>(),
    };
    return createClaudeAgentSdkDriver(callbacks);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readSessionCwd).mockResolvedValue(cwd);
    vi.mocked(getSessionMessages).mockResolvedValue([]);
    vi.mocked(query).mockReturnValue({ setPermissionMode } as unknown as Query);
    vi.mocked(watchSession).mockResolvedValue(undefined);
  });

  test("A side chat never leaves plan mode", async () => {
    expect.hasAssertions();

    const driver = createDriver();
    const sideChatSessionId = await driver.forkSession(sessionId, "", true);

    await expect(
      driver.setPermissionMode(sideChatSessionId, PermissionMode.BypassPermissions),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Update, sideChatSessionId, "a side chat stays in plan mode").message}]`,
    );
    expect(setPermissionMode).not.toHaveBeenCalled();
  });

  test("A main session's permission mode changes as asked", async () => {
    expect.hasAssertions();

    const driver = createDriver();
    const mainSessionId = await driver.resumeSession(sessionId);

    await driver.setPermissionMode(mainSessionId, PermissionMode.BypassPermissions);

    expect(setPermissionMode).toHaveBeenCalledExactlyOnceWith(PermissionMode.BypassPermissions);
  });
});
