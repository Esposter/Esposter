import type { execFileSync as baseExecFileSync } from "node:child_process";

import {
  TEST_REPO_ROOT_WIN,
  TEST_WSL_LEGACY_UNC_PREFIX,
  TEST_WSL_PREFIX,
  TEST_WSL_STORE_LINUX,
  TEST_WSL_UNC_PREFIX,
} from "@/services/exec/wsl/constants.test";
import { createTestWslUnc } from "@/services/exec/wsl/createTestWslUnc.test";
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

  test(`maps a ${TEST_WSL_UNC_PREFIX} UNC to its Linux path without invoking wslpath`, () => {
    expect.hasAssertions();

    expect(readWslPath(createTestWslUnc(TEST_WSL_STORE_LINUX))).toBe(TEST_WSL_STORE_LINUX);
    expect(execFileSync).not.toHaveBeenCalled();
  });

  test(`maps a ${TEST_WSL_LEGACY_UNC_PREFIX} UNC to its Linux path without invoking wslpath`, () => {
    expect.hasAssertions();

    expect(readWslPath(createTestWslUnc(TEST_WSL_STORE_LINUX, TEST_WSL_LEGACY_UNC_PREFIX))).toBe(TEST_WSL_STORE_LINUX);
    expect(execFileSync).not.toHaveBeenCalled();
  });

  test("maps a bare distro-root UNC to /", () => {
    expect.hasAssertions();

    expect(readWslPath(createTestWslUnc(""))).toBe("/");
    expect(execFileSync).not.toHaveBeenCalled();
  });
});
