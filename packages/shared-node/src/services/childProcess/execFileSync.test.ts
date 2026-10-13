import type { execFileSync as baseExecFileSync } from "node:child_process";

import { execFileSync } from "#src/services/childProcess/execFileSync";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { nodeFunction } = vi.hoisted(() => ({ nodeFunction: vi.fn<typeof baseExecFileSync>() }));

vi.mock(import("node:child_process"), () => ({ execFileSync: nodeFunction as unknown as typeof baseExecFileSync }));

describe(execFileSync, () => {
  const file = "file";
  const args = ["argument"];

  beforeEach(() => {
    nodeFunction.mockReset();
  });

  test("hides the window when the caller passes no options", () => {
    expect.hasAssertions();

    execFileSync(file, args);

    expect(nodeFunction).toHaveBeenCalledExactlyOnceWith(file, args, { windowsHide: true });
  });

  test("keeps the caller's options and hides the window last", () => {
    expect.hasAssertions();

    execFileSync(file, args, { cwd: file });

    expect(nodeFunction).toHaveBeenCalledExactlyOnceWith(file, args, { cwd: file, windowsHide: true });
  });

  test("a caller cannot re-show the window by passing windowsHide false", () => {
    expect.hasAssertions();

    execFileSync(file, args, { windowsHide: false });

    expect(nodeFunction).toHaveBeenCalledExactlyOnceWith(file, args, { windowsHide: true });
  });
});
