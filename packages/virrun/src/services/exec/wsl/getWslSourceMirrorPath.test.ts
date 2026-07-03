import { VIRRUN_SOURCES_DIRECTORY_NAME } from "@/services/exec/wsl/constants";
import { TEST_REPO_ROOT_WIN, TEST_WSL_CACHE_ROOT_LINUX, TEST_WSL_PREFIX } from "@/services/exec/wsl/constants.test";
import { createTestWslUnc } from "@/services/exec/wsl/createTestWslUnc.test";
import { getWslSourceMirrorPath } from "@/services/exec/wsl/getWslSourceMirrorPath";
import { createHash } from "node:crypto";
import { describe, expect, test, vi } from "vitest";
// Same mocks as ensureWslSourceMirror.test: getWslNativeCacheRoot resolves to a UNC, readWslPath applies the shared
// `${TEST_WSL_PREFIX}${path}` transform, so the expected mirror path is derived from the shared constants.
vi.mock(import("@/services/exec/wsl/getWslNativeCacheRoot"), () => ({
  getWslNativeCacheRoot: () => createTestWslUnc(TEST_WSL_CACHE_ROOT_LINUX),
}));

vi.mock(import("@/services/exec/wsl/readWslPath"), () => ({
  readWslPath: (path: string) => `${TEST_WSL_PREFIX}${path}`,
}));

describe(getWslSourceMirrorPath, () => {
  const cacheRootLinux = `${TEST_WSL_PREFIX}${createTestWslUnc(TEST_WSL_CACHE_ROOT_LINUX)}`;

  test("addresses the ext4 mirror under sources/<sha256(hostCwd)> so distinct repos never collide", () => {
    expect.hasAssertions();

    const key = createHash("sha256").update(TEST_REPO_ROOT_WIN).digest("hex");

    expect(getWslSourceMirrorPath(TEST_REPO_ROOT_WIN)).toBe(
      `${cacheRootLinux}/${VIRRUN_SOURCES_DIRECTORY_NAME}/${key}`,
    );
  });

  test("keys on the exact host cwd so a subpackage cwd resolves a distinct mirror", () => {
    expect.hasAssertions();

    const subPackage = `${TEST_REPO_ROOT_WIN}\\packages\\app`;

    expect(getWslSourceMirrorPath(subPackage)).not.toBe(getWslSourceMirrorPath(TEST_REPO_ROOT_WIN));
  });
});
