import type { spawn as baseSpawn, ChildProcess } from "node:child_process";

import { spawnHidden } from "@/services/exec/util/spawnHidden";
import { takeOne } from "@esposter/shared";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { spawn } = vi.hoisted(() => ({ spawn: vi.fn<typeof baseSpawn>() }));

vi.mock(import("node:child_process"), () => ({ spawn: spawn as unknown as typeof baseSpawn }));

describe(spawnHidden, () => {
  const file = "wsl.exe";
  const args = ["--exec", "true"];

  beforeEach(() => {
    spawn.mockReset();
  });

  test("forwards file and args and forces windowsHide on top of the caller options", () => {
    expect.hasAssertions();

    spawnHidden(file, args, { stdio: "ignore" });

    expect(spawn).toHaveBeenCalledExactlyOnceWith(file, args, { stdio: "ignore", windowsHide: true });
  });

  test("a caller cannot re-show the window by passing windowsHide false", () => {
    expect.hasAssertions();

    spawnHidden(file, args, { stdio: "ignore", windowsHide: false });

    const [, , options] = takeOne(spawn.mock.calls, 0);
    expect(options?.windowsHide).toBe(true);
  });
});
