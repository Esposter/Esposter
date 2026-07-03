import type { spawn as baseSpawn, ChildProcess } from "node:child_process";

import { spawnBackground } from "@/services/exec/util/spawnBackground";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { spawn } = vi.hoisted(() => ({ spawn: vi.fn<typeof baseSpawn>() }));

vi.mock(import("node:child_process"), () => ({ spawn: spawn as unknown as typeof baseSpawn }));

describe(spawnBackground, () => {
  const child = { on: vi.fn<() => void>(), unref: vi.fn<() => void>() };

  beforeEach(() => {
    vi.clearAllMocks();
    spawn.mockReturnValue(child as unknown as ChildProcess);
  });

  test("spawns a hidden, stdio-ignored child and never detaches", () => {
    expect.hasAssertions();

    spawnBackground("wsl.exe", ["--exec", "true"]);

    // The regression this guards: `detached` makes win32 ignore windowsHide and flash an empty console
    // (nodejs#21825). toHaveBeenCalledExactlyOnceWith matches the options object exactly, so this fails if a
    // `detached` (or any other) key is ever reintroduced — the shape must stay stdio-ignore + windowsHide.
    expect(spawn).toHaveBeenCalledExactlyOnceWith("wsl.exe", ["--exec", "true"], {
      stdio: "ignore",
      windowsHide: true,
    });
  });

  test("swallows the async error and unrefs so the parent can exit while it runs", () => {
    expect.hasAssertions();

    spawnBackground("wsl.exe", []);

    expect(child.on).toHaveBeenCalledWith("error", expect.any(Function));
    expect(child.unref).toHaveBeenCalledExactlyOnceWith();
  });
});
