import type baseCrossSpawn from "cross-spawn";
import type { spawn as baseSpawn } from "node:child_process";

import { spawnHidden } from "#src/services/exec/spawn/spawnHidden";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { crossSpawn, spawn } = vi.hoisted(() => ({
  crossSpawn: vi.fn<typeof baseSpawn>(),
  spawn: vi.fn<typeof baseSpawn>(),
}));

vi.mock(import("cross-spawn"), () => ({ default: crossSpawn as unknown as typeof baseCrossSpawn }));
vi.mock(import("node:child_process"), () => ({ spawn: spawn as unknown as typeof baseSpawn }));

describe(spawnHidden, () => {
  const file = "";
  const args: string[] = [];

  beforeEach(() => {
    crossSpawn.mockReset();
    spawn.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("forwards file and args and forces windowsHide on top of the caller options", () => {
    expect.hasAssertions();

    spawnHidden(file, args, { stdio: "ignore" });

    expect(crossSpawn).toHaveBeenCalledExactlyOnceWith(file, args, { stdio: "ignore", windowsHide: true });
  });

  test("a caller cannot re-show the window by passing windowsHide false", () => {
    expect.hasAssertions();

    spawnHidden(file, args, { stdio: "ignore", windowsHide: false });

    // Spread last, windowsHide overrides the caller's false — the exact-match proves the window stays hidden.
    expect(crossSpawn).toHaveBeenCalledExactlyOnceWith(file, args, { stdio: "ignore", windowsHide: true });
  });

  // Cross-spawn reads a win32 shell's exit code 1 as the command missing, so a shell string must bypass it
  test("runs a shell command string through node's spawn", () => {
    expect.hasAssertions();

    spawnHidden(file, args, { shell: true });

    expect(crossSpawn).not.toHaveBeenCalled();
    expect(spawn).toHaveBeenCalledExactlyOnceWith(file, args, { shell: true, windowsHide: true });
  });

  // Cross-spawn's cmd.exe escaping leaves a line break bare, and cmd.exe ends the command there
  test("refuses a win32 argv carrying a line break", () => {
    expect.hasAssertions();

    vi.stubGlobal("process", { ...process, platform: "win32" });

    expect(() => spawnHidden(file, ["\n"], {})).toThrow("line break");
    expect(crossSpawn).not.toHaveBeenCalled();
  });
});
