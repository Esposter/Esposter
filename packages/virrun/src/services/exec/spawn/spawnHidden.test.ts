import type { spawnResolved as baseSpawnResolved } from "#src/services/exec/spawn/spawnResolved";
import type { spawn as baseSpawn } from "node:child_process";

import { spawnHidden } from "#src/services/exec/spawn/spawnHidden";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { spawn, spawnResolved } = vi.hoisted(() => ({
  spawn: vi.fn<typeof baseSpawn>(),
  spawnResolved: vi.fn<typeof baseSpawnResolved>(),
}));

vi.mock(import("#src/services/exec/spawn/spawnResolved"), () => ({
  spawnResolved: spawnResolved as unknown as typeof baseSpawnResolved,
}));
vi.mock(import("@esposter/shared-node/child-process"), () => ({ spawn: spawn as unknown as typeof baseSpawn }));

describe(spawnHidden, () => {
  const file = "";
  const args: string[] = [];

  beforeEach(() => {
    spawnResolved.mockReset();
    spawn.mockReset();
  });

  test("forwards file, args and the caller options to spawnResolved unchanged", () => {
    expect.hasAssertions();

    spawnHidden(file, args, { stdio: "ignore" });

    expect(spawnResolved).toHaveBeenCalledExactlyOnceWith(file, args, { stdio: "ignore" });
  });

  // A shell's exit code 1 reads as the command missing when it goes through spawnResolved, so a shell string bypasses it
  test("runs a shell command string through node's spawn", () => {
    expect.hasAssertions();

    spawnHidden(file, args, { shell: true });

    expect(spawnResolved).not.toHaveBeenCalled();
    expect(spawn).toHaveBeenCalledExactlyOnceWith(file, args, { shell: true });
  });
});
