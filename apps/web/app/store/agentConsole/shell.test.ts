// @vitest-environment nuxt
import type { ShellListener } from "@/models/agentConsole/ShellListener";

import { useAgentConsoleShellStore } from "@/store/agentConsole/shell";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

const createShellListener = (): ShellListener => ({
  reset: vi.fn<ShellListener["reset"]>(),
  write: vi.fn<ShellListener["write"]>(),
});

describe(useAgentConsoleShellStore, () => {
  const connectionId = crypto.randomUUID();
  const sessionId = crypto.randomUUID();
  const shellId = crypto.randomUUID();

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("writes a terminal opened later what the shell printed before it, then what comes after", () => {
    expect.hasAssertions();

    const agentConsoleShellStore = useAgentConsoleShellStore();
    agentConsoleShellStore.storeShellOpened({ connectionId, id: shellId, sessionId });
    agentConsoleShellStore.storeShellOutput(shellId, "a");
    const shellListener = createShellListener();
    agentConsoleShellStore.listenToShell(shellId, shellListener);
    agentConsoleShellStore.storeShellOutput(shellId, "b");

    expect(vi.mocked(shellListener.write).mock.calls).toStrictEqual([["a"], ["b"]]);
  });

  // A reconnect replays a shell from the start of what the host kept, which the page already showed
  test("clears a shell the host replays rather than showing its output twice", () => {
    expect.hasAssertions();

    const agentConsoleShellStore = useAgentConsoleShellStore();
    agentConsoleShellStore.storeShellOpened({ connectionId, id: shellId, sessionId });
    agentConsoleShellStore.storeShellOutput(shellId, "a");
    const shellListener = createShellListener();
    agentConsoleShellStore.listenToShell(shellId, shellListener);
    agentConsoleShellStore.storeShellOpened({ connectionId, id: shellId, sessionId });
    const laterShellListener = createShellListener();
    agentConsoleShellStore.listenToShell(shellId, laterShellListener);

    expect(shellListener.reset).toHaveBeenCalledTimes(1);
    expect(agentConsoleShellStore.shells).toHaveLength(1);
    expect(vi.mocked(laterShellListener.write).mock.calls).toStrictEqual([[""]]);
  });
});
