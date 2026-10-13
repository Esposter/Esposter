import type { spawnSync as baseSpawnSync } from "node:child_process";

import { spawnSync } from "#src/services/childProcess/spawnSync";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { nodeFunction } = vi.hoisted(() => ({ nodeFunction: vi.fn<typeof baseSpawnSync>() }));

vi.mock(import("node:child_process"), () => ({ spawnSync: nodeFunction as unknown as typeof baseSpawnSync }));

describe(spawnSync, () => {
  const file = "file";
  const args = ["argument"];

  beforeEach(() => {
    nodeFunction.mockReset();
  });

  test("hides the window when the caller passes no options", () => {
    expect.hasAssertions();

    spawnSync(file, args);

    expect(nodeFunction).toHaveBeenCalledExactlyOnceWith(file, args, { windowsHide: true });
  });

  test("keeps the caller's options and hides the window last", () => {
    expect.hasAssertions();

    spawnSync(file, args, { cwd: file });

    expect(nodeFunction).toHaveBeenCalledExactlyOnceWith(file, args, { cwd: file, windowsHide: true });
  });

  test("a caller cannot re-show the window by passing windowsHide false", () => {
    expect.hasAssertions();

    spawnSync(file, args, { windowsHide: false });

    expect(nodeFunction).toHaveBeenCalledExactlyOnceWith(file, args, { windowsHide: true });
  });
});
