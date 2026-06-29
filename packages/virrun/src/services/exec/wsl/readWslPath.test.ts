import type { execFileSync as baseExecFileSync } from "node:child_process";

import { TEST_REPO_ROOT_WIN, TEST_WSL_PREFIX } from "@/services/exec/wsl/constants.test";
import { readWslPath } from "@/services/exec/wsl/readWslPath";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { execFileSync } = vi.hoisted(() => ({
  execFileSync: vi.fn<typeof baseExecFileSync>(((_file, args) =>
    Array.isArray(args) ? `${TEST_WSL_PREFIX}${args.at(-1) ?? ""}\n` : "") as typeof baseExecFileSync),
}));

vi.mock(import("node:child_process"), () => ({
  execFileSync: execFileSync as unknown as typeof baseExecFileSync,
}));

describe(readWslPath, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("memoizes translated paths", () => {
    expect.hasAssertions();

    expect(readWslPath(TEST_REPO_ROOT_WIN)).toBe(`${TEST_WSL_PREFIX}${TEST_REPO_ROOT_WIN}`);
    expect(readWslPath(TEST_REPO_ROOT_WIN)).toBe(`${TEST_WSL_PREFIX}${TEST_REPO_ROOT_WIN}`);
    expect(execFileSync).toHaveBeenCalledTimes(1);
  });

  test("maps a wsl.localhost UNC to its Linux path without invoking wslpath", () => {
    expect.hasAssertions();

    expect(readWslPath(String.raw`\\wsl.localhost\Ubuntu\home\jimmyc\.virrun`)).toBe("/home/jimmyc/.virrun");
    expect(execFileSync).not.toHaveBeenCalled();
  });

  test("maps a wsl$ UNC to its Linux path without invoking wslpath", () => {
    expect.hasAssertions();

    expect(readWslPath(String.raw`\\wsl$\Ubuntu\home\jimmyc\store`)).toBe("/home/jimmyc/store");
    expect(execFileSync).not.toHaveBeenCalled();
  });

  test("maps a bare distro-root UNC to /", () => {
    expect.hasAssertions();

    expect(readWslPath(String.raw`\\wsl.localhost\Ubuntu`)).toBe("/");
    expect(execFileSync).not.toHaveBeenCalled();
  });
});
