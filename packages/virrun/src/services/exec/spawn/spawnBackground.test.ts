import type { spawnResolved as baseSpawnResolved } from "#src/services/exec/spawn/spawnResolved";
import type { spawn as baseSpawn, ChildProcess } from "node:child_process";

import { spawnBackground } from "#src/services/exec/spawn/spawnBackground";
import { noop } from "@esposter/shared";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { spawnResolved } = vi.hoisted(() => ({ spawnResolved: vi.fn<typeof baseSpawn>() }));

vi.mock(import("#src/services/exec/spawn/spawnResolved"), () => ({
  spawnResolved: spawnResolved as unknown as typeof baseSpawnResolved,
}));

describe(spawnBackground, () => {
  const child = { on: vi.fn<() => void>(), unref: vi.fn<() => void>() };

  beforeEach(() => {
    spawnResolved.mockReturnValue(child as unknown as ChildProcess);
  });

  test("spawns a hidden, stdio-ignored child and never detaches", () => {
    expect.hasAssertions();

    spawnBackground("", []);

    // The regression this guards: `detached` makes win32 ignore windowsHide and flash an empty console
    // (nodejs#21825). toHaveBeenCalledExactlyOnceWith matches the options object exactly, so this fails if a
    // `detached` (or any other) key is ever reintroduced — the shape must stay stdio-ignore. The window hiding is the
    // Shared wrapper's, applied where the child is spawned.
    expect(spawnResolved).toHaveBeenCalledExactlyOnceWith("", [], { stdio: "ignore" });
  });

  test("swallows the async error and unrefs so the parent can exit while it runs", () => {
    expect.hasAssertions();

    spawnBackground("", []);

    expect(child.on).toHaveBeenCalledExactlyOnceWith("error", noop);
    expect(child.unref).toHaveBeenCalledExactlyOnceWith();
  });
});
