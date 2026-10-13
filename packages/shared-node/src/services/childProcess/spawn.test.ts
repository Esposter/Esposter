import type { spawn as baseSpawn } from "node:child_process";

import { spawn } from "#src/services/childProcess/spawn";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { nodeFunction } = vi.hoisted(() => ({ nodeFunction: vi.fn<typeof baseSpawn>() }));

vi.mock(import("node:child_process"), () => ({ spawn: nodeFunction as unknown as typeof baseSpawn }));

describe(spawn, () => {
  const file = "file";
  const args = ["argument"];

  beforeEach(() => {
    nodeFunction.mockReset();
  });

  test("hides the window when the caller passes no options", () => {
    expect.hasAssertions();

    spawn(file, args);

    expect(nodeFunction).toHaveBeenCalledExactlyOnceWith(file, args, { windowsHide: true });
  });

  test("keeps the caller's options and hides the window last", () => {
    expect.hasAssertions();

    spawn(file, args, { cwd: file });

    expect(nodeFunction).toHaveBeenCalledExactlyOnceWith(file, args, { cwd: file, windowsHide: true });
  });

  test("a caller cannot re-show the window by passing windowsHide false", () => {
    expect.hasAssertions();

    spawn(file, args, { windowsHide: false });

    expect(nodeFunction).toHaveBeenCalledExactlyOnceWith(file, args, { windowsHide: true });
  });
});
