import type { execFileSync as baseExecFileSync } from "node:child_process";

import { VIRRUN_SOURCES_DIRECTORY_NAME } from "@/services/exec/wsl/constants";
import { TEST_REPO_ROOT_WIN, TEST_WSL_CACHE_ROOT_LINUX, TEST_WSL_PREFIX } from "@/services/exec/wsl/constants.test";
import { createTestWslUnc } from "@/services/exec/wsl/createTestWslUnc.test";
import { ensureWslSourceMirror } from "@/services/exec/wsl/ensureWslSourceMirror";
import { InvalidOperationError, Operation, takeOne, toAppError } from "@esposter/shared";
import { createHash } from "node:crypto";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { execFileSync } = vi.hoisted(() => ({ execFileSync: vi.fn<typeof baseExecFileSync>() }));

vi.mock(import("node:child_process"), () => ({ execFileSync: execFileSync as unknown as typeof baseExecFileSync }));
// GetWslNativeCacheRoot resolves to a UNC; readWslPath translates both it and the win cwd. Mock readWslPath with the
// Same `${TEST_WSL_PREFIX}${path}` transform the sibling wsl tests use, so the expected source + cache paths are
// Derived from the shared constants rather than hardcoded Linux literals.
vi.mock(import("@/services/exec/wsl/getWslNativeCacheRoot"), () => ({
  getWslNativeCacheRoot: () => createTestWslUnc(TEST_WSL_CACHE_ROOT_LINUX),
}));

vi.mock(import("@/services/exec/wsl/readWslPath"), () => ({
  readWslPath: (path: string) => `${TEST_WSL_PREFIX}${path}`,
}));

describe(ensureWslSourceMirror, () => {
  const sourceLinux = `${TEST_WSL_PREFIX}${TEST_REPO_ROOT_WIN}`;
  const cacheRootLinux = `${TEST_WSL_PREFIX}${createTestWslUnc(TEST_WSL_CACHE_ROOT_LINUX)}`;
  const key = createHash("sha256").update(TEST_REPO_ROOT_WIN).digest("hex");
  const mirrorPath = `${cacheRootLinux}/${VIRRUN_SOURCES_DIRECTORY_NAME}/${key}`;

  beforeEach(() => {
    execFileSync.mockReset();
  });

  test("syncs the source to the ext4 mirror under an exclusive lock and returns the mirror path", () => {
    expect.hasAssertions();

    const returned = ensureWslSourceMirror(TEST_REPO_ROOT_WIN);
    const { calls } = execFileSync.mock;
    const [file, args] = takeOne(calls, 0);
    const script = takeOne(args ?? [], 3);

    expect(returned).toBe(mirrorPath);
    expect(file).toBe("wsl.exe");
    expect([takeOne(args ?? []), takeOne(args ?? [], 1), takeOne(args ?? [], 2)]).toStrictEqual(["--exec", "sh", "-c"]);
    expect(script).toBe(
      `mkdir -p "${mirrorPath}" && flock "${mirrorPath}.lock" rsync -a --delete --exclude=node_modules --exclude=.git "${sourceLinux}/" "${mirrorPath}/"`,
    );
  });

  test("throws when the sync fails rather than running against a stale mirror", () => {
    expect.hasAssertions();

    const failure = " ";
    execFileSync.mockImplementation(() => {
      throw new Error(failure);
    });

    expect(() => ensureWslSourceMirror(TEST_REPO_ROOT_WIN)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Create, ensureWslSourceMirror.name, toAppError(new Error(failure)).message).message}]`,
    );
  });
});
