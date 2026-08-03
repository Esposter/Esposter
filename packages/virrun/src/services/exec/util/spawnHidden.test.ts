import type { spawn as baseSpawn } from "node:child_process";

import { spawnHidden } from "@/services/exec/util/spawnHidden";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { spawn } = vi.hoisted(() => ({ spawn: vi.fn<typeof baseSpawn>() }));

vi.mock(import("node:child_process"), () => ({ spawn: spawn as unknown as typeof baseSpawn }));

describe(spawnHidden, () => {
  const file = "wsl.exe";
  const commandArguments = ["--exec", "true"];

  beforeEach(() => {
    spawn.mockReset();
  });

  test("forwards file and args and forces windowsHide on top of the caller options", () => {
    expect.hasAssertions();

    spawnHidden(file, commandArguments, { stdio: "ignore" });

    expect(spawn).toHaveBeenCalledExactlyOnceWith(file, commandArguments, { stdio: "ignore", windowsHide: true });
  });

  test("a caller cannot re-show the window by passing windowsHide false", () => {
    expect.hasAssertions();

    spawnHidden(file, commandArguments, { stdio: "ignore", windowsHide: false });

    // Spread last, windowsHide overrides the caller's false — the exact-match proves the window stays hidden.
    expect(spawn).toHaveBeenCalledExactlyOnceWith(file, commandArguments, { stdio: "ignore", windowsHide: true });
  });
});
