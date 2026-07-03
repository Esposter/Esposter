import type { spawn as baseSpawn, ChildProcess } from "node:child_process";

import { spawnBackground } from "@/services/exec/util/spawnBackground";
import { takeOne } from "@esposter/shared";
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
    // (nodejs#21825), so the options must be exactly stdio-ignore + windowsHide with no detach flag.
    expect(spawn).toHaveBeenCalledExactlyOnceWith("wsl.exe", ["--exec", "true"], {
      stdio: "ignore",
      windowsHide: true,
    });
    const [, , options] = takeOne(spawn.mock.calls, 0);
    expect(options).not.toHaveProperty("detached");
  });

  test("swallows the async error and unrefs so the parent can exit while it runs", () => {
    expect.hasAssertions();

    spawnBackground("wsl.exe", []);

    expect(child.on).toHaveBeenCalledWith("error", expect.any(Function));
    expect(child.unref).toHaveBeenCalledOnceWith();
  });
});
