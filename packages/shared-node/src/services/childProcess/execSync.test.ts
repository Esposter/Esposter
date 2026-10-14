import type { execSync as baseExecSync } from "node:child_process";

import { execSync } from "#src/services/childProcess/execSync";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { nodeFunction } = vi.hoisted(() => ({ nodeFunction: vi.fn<typeof baseExecSync>() }));

vi.mock(import("node:child_process"), () => ({ execSync: nodeFunction as unknown as typeof baseExecSync }));

describe(execSync, () => {
  const file = "file";

  beforeEach(() => {
    nodeFunction.mockReset();
  });

  test("hides the window when the caller passes no options", () => {
    expect.hasAssertions();

    execSync(file);

    expect(nodeFunction).toHaveBeenCalledExactlyOnceWith(file, { windowsHide: true });
  });

  test("keeps the caller's options and hides the window last", () => {
    expect.hasAssertions();

    execSync(file, { timeout: 1 });

    expect(nodeFunction).toHaveBeenCalledExactlyOnceWith(file, { timeout: 1, windowsHide: true });
  });

  test("an undefined options argument is the options slot, not an args slot", () => {
    expect.hasAssertions();

    execSync(file, undefined);

    expect(nodeFunction).toHaveBeenCalledExactlyOnceWith(file, { windowsHide: true });
  });

  test("a caller cannot re-show the window by passing windowsHide false", () => {
    expect.hasAssertions();

    execSync(file, { windowsHide: false });

    expect(nodeFunction).toHaveBeenCalledExactlyOnceWith(file, { windowsHide: true });
  });
});
