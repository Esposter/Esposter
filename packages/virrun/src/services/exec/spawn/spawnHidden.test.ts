import type { spawnResolved as baseSpawnResolved } from "#src/services/exec/spawn/spawnResolved";
import type { spawn as baseSpawn } from "node:child_process";

import { spawnHidden } from "#src/services/exec/spawn/spawnHidden";
import { setupPlatformStub } from "#src/services/exec/test/setupPlatformStub.test";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { spawn, spawnResolved } = vi.hoisted(() => ({
  spawn: vi.fn<typeof baseSpawn>(),
  spawnResolved: vi.fn<typeof baseSpawnResolved>(),
}));

vi.mock(import("#src/services/exec/spawn/spawnResolved"), () => ({
  spawnResolved: spawnResolved as unknown as typeof baseSpawnResolved,
}));
vi.mock(import("node:child_process"), () => ({ spawn: spawn as unknown as typeof baseSpawn }));

describe(spawnHidden, () => {
  const file = "";
  const args: string[] = [];
  const stubPlatform = setupPlatformStub();

  beforeEach(() => {
    spawnResolved.mockReset();
    spawn.mockReset();
  });

  test("forwards file and args and forces windowsHide on top of the caller options", () => {
    expect.hasAssertions();

    spawnHidden(file, args, { stdio: "ignore" });

    expect(spawnResolved).toHaveBeenCalledExactlyOnceWith(file, args, { stdio: "ignore", windowsHide: true });
  });

  test("#143 a caller cannot re-show the window by passing windowsHide false", () => {
    expect.hasAssertions();

    spawnHidden(file, args, { stdio: "ignore", windowsHide: false });

    // Spread last, windowsHide overrides the caller's false — the exact-match proves the window stays hidden.
    expect(spawnResolved).toHaveBeenCalledExactlyOnceWith(file, args, { stdio: "ignore", windowsHide: true });
  });

  // A shell's exit code 1 reads as the command missing when it goes through spawnResolved, so a shell string bypasses it
  test("runs a shell command string through node's spawn", () => {
    expect.hasAssertions();

    spawnHidden(file, args, { shell: true });

    expect(spawnResolved).not.toHaveBeenCalled();
    expect(spawn).toHaveBeenCalledExactlyOnceWith(file, args, { shell: true, windowsHide: true });
  });

  // Cmd.exe ends the command at a bare line break even inside quotes, so the rest would run as a second command
  test("#179 refuses a win32 argv carrying a line break", () => {
    expect.hasAssertions();

    stubPlatform("win32");

    expect(() => spawnHidden(file, ["\n"], {})).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: , a win32 argv cannot carry a line break or a percent sign]`,
    );
    expect(spawnResolved).not.toHaveBeenCalled();
  });

  // Regression for BatBadBut (https://github.com/moxystudio/node-cross-spawn/issues/171): a `%name%` argument is
  // Expanded by cmd.exe from an environment variable whose name the caret escaping itself spells, so cross-spawn's
  // Escaping cannot make it data. Upstream spawns it anyway; this refuses it.
  test("#171 refuses a win32 argv carrying a percent sign, which cmd.exe expands as an environment variable", () => {
    expect.hasAssertions();

    stubPlatform("win32");

    expect(() => spawnHidden(file, ["%path%"], {})).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: , a win32 argv cannot carry a line break or a percent sign]`,
    );
    expect(spawnResolved).not.toHaveBeenCalled();
  });

  test("passes a percent sign through off win32, where no cmd.exe parses the argv", () => {
    expect.hasAssertions();

    stubPlatform("linux");

    spawnHidden(file, ["%path%"], {});

    expect(spawnResolved).toHaveBeenCalledExactlyOnceWith(file, ["%path%"], { windowsHide: true });
  });
});
