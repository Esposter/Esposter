import { VIRRUN_SOURCE_MIRROR_TREE_DIRECTORY_NAME, VIRRUN_SOURCES_DIRECTORY_NAME } from "@/services/exec/wsl/constants";
import { TEST_REPO_ROOT_WIN, TEST_WSL_CACHE_ROOT_LINUX, TEST_WSL_PREFIX } from "@/services/exec/wsl/constants.test";
import { createTestWslUnc } from "@/services/exec/wsl/createTestWslUnc.test";
import { getSourceMirrorKey } from "@/services/exec/wsl/getSourceMirrorKey";
import { getWslSourceMirrorEntryPath } from "@/services/exec/wsl/getWslSourceMirrorEntryPath";
import { getWslSourceMirrorEntryUnc } from "@/services/exec/wsl/getWslSourceMirrorEntryUnc";
import { getWslSourceMirrorPath } from "@/services/exec/wsl/getWslSourceMirrorPath";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";
// The three mirror-path resolvers are one-line joins over the shared getSourceMirrorKey, and all three need the same
// Mocked cache root, so they share a suite instead of each repeating these two vi.mock blocks: getWslNativeCacheRoot
// Resolves to a UNC and readWslPath applies the shared `${TEST_WSL_PREFIX}${path}` transform, so every expected path
// Is derived from the shared constants. Same mocks as createWslSourceMirrorSync.test.
vi.mock(import("@/services/exec/wsl/getWslNativeCacheRoot"), () => ({
  getWslNativeCacheRoot: () => createTestWslUnc(TEST_WSL_CACHE_ROOT_LINUX),
}));

vi.mock(import("@/services/exec/wsl/readWslPath"), () => ({
  readWslPath: (path: string) => `${TEST_WSL_PREFIX}${path}`,
}));

const cacheRootLinux = `${TEST_WSL_PREFIX}${createTestWslUnc(TEST_WSL_CACHE_ROOT_LINUX)}`;

describe(getWslSourceMirrorEntryPath, () => {
  test("addresses the entry dir under sources/<sha256(hostCwd)> so distinct repos never collide", () => {
    expect.hasAssertions();

    const key = createHash("sha256").update(TEST_REPO_ROOT_WIN).digest("hex");

    expect(getWslSourceMirrorEntryPath(TEST_REPO_ROOT_WIN)).toBe(
      `${cacheRootLinux}/${VIRRUN_SOURCES_DIRECTORY_NAME}/${key}`,
    );
  });

  // GetWslSourceMirrorPath is `${getWslSourceMirrorEntryPath(cwd)}/tree`, so this also covers its keying.
  test("keys on the exact host cwd so a subpackage cwd resolves a distinct entry", () => {
    expect.hasAssertions();

    const subPackage = `${TEST_REPO_ROOT_WIN}\\packages\\app`;

    expect(getWslSourceMirrorEntryPath(subPackage)).not.toBe(getWslSourceMirrorEntryPath(TEST_REPO_ROOT_WIN));
  });
});

describe(getWslSourceMirrorPath, () => {
  test("addresses the mirror tree under sources/<sha256(hostCwd)>/tree so distinct repos never collide", () => {
    expect.hasAssertions();

    const key = createHash("sha256").update(TEST_REPO_ROOT_WIN).digest("hex");

    expect(getWslSourceMirrorPath(TEST_REPO_ROOT_WIN)).toBe(
      `${cacheRootLinux}/${VIRRUN_SOURCES_DIRECTORY_NAME}/${key}/${VIRRUN_SOURCE_MIRROR_TREE_DIRECTORY_NAME}`,
    );
  });
});

describe(getWslSourceMirrorEntryUnc, () => {
  test("addresses the same keyed entry as the Linux-side resolver, as a host UNC", () => {
    expect.hasAssertions();

    expect(getWslSourceMirrorEntryUnc(TEST_REPO_ROOT_WIN)).toBe(
      join(
        createTestWslUnc(TEST_WSL_CACHE_ROOT_LINUX),
        VIRRUN_SOURCES_DIRECTORY_NAME,
        getSourceMirrorKey(TEST_REPO_ROOT_WIN),
      ),
    );
  });
});
