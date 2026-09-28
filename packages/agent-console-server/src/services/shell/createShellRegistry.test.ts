import type { ShellTerminal } from "#src/models/shell/ShellTerminal";

import { createShellRegistry } from "#src/services/shell/createShellRegistry";
import { describe, expect, test, vi } from "vitest";

describe(createShellRegistry, () => {
  const sessionId = " ";
  const options = { cols: 1, cwd: " ", rows: 1 };
  // A shell still starting, handed over only when the test says so
  const createPendingShell = () => {
    const terminal: ShellTerminal = {
      kill: vi.fn<ShellTerminal["kill"]>(),
      onData: vi.fn<ShellTerminal["onData"]>(),
      onExit: vi.fn<ShellTerminal["onExit"]>(),
      resize: vi.fn<ShellTerminal["resize"]>(),
      write: vi.fn<ShellTerminal["write"]>(),
    };
    const { promise, resolve } = Promise.withResolvers<ShellTerminal>();
    const shellRegistry = createShellRegistry({ onClose: vi.fn(), onOutput: vi.fn(), spawnShell: () => promise });
    return { resolve: () => resolve(terminal), shellRegistry, terminal };
  };

  test("ends a shell whose session closed as it started", async () => {
    expect.hasAssertions();

    const { resolve, shellRegistry, terminal } = createPendingShell();
    const pendingShellId = shellRegistry.open(sessionId, options);
    shellRegistry.closeSession(sessionId);
    resolve();

    await expect(pendingShellId).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name:  , the shell's session or host closed as it started]`,
    );
    expect(terminal.kill).toHaveBeenCalledOnce();
    expect(shellRegistry.entries()).toStrictEqual([]);
  });

  test("ends a shell whose host stopped as it started, and starts none after", async () => {
    expect.hasAssertions();

    const { resolve, shellRegistry, terminal } = createPendingShell();
    const pendingShellId = shellRegistry.open(sessionId, options);
    shellRegistry.closeAll();
    resolve();

    await expect(pendingShellId).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name:  , the shell's session or host closed as it started]`,
    );
    await expect(shellRegistry.open(sessionId, options)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name:  , the host is stopping]`,
    );
    expect(terminal.kill).toHaveBeenCalledOnce();
    expect(shellRegistry.entries()).toStrictEqual([]);
  });
});
