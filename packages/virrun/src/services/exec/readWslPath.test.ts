import type { execFileSync as baseExecFileSync } from "node:child_process";

import { TEST_REPO_ROOT_WIN, TEST_WSL_PREFIX } from "@/services/exec/constants.test";
import { readWslPath } from "@/services/exec/readWslPath";
import { describe, expect, test, vi } from "vitest";

const { execFileSync } = vi.hoisted(() => ({
  execFileSync: vi.fn<typeof baseExecFileSync>(((_file, args) =>
    Array.isArray(args) ? `${TEST_WSL_PREFIX}${args.at(-1) ?? ""}\n` : "") as typeof baseExecFileSync),
}));

vi.mock(import("node:child_process"), () => ({
  execFileSync: execFileSync as unknown as typeof baseExecFileSync,
}));

describe(readWslPath, () => {
  test("memoizes translated paths", () => {
    expect.hasAssertions();

    expect(readWslPath(TEST_REPO_ROOT_WIN)).toBe(`${TEST_WSL_PREFIX}${TEST_REPO_ROOT_WIN}`);
    expect(readWslPath(TEST_REPO_ROOT_WIN)).toBe(`${TEST_WSL_PREFIX}${TEST_REPO_ROOT_WIN}`);
    expect(execFileSync).toHaveBeenCalledTimes(1);
  });
});
