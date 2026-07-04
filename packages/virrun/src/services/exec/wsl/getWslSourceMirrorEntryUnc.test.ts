import { VIRRUN_SOURCES_DIRECTORY_NAME } from "@/services/exec/wsl/constants";
import { TEST_REPO_ROOT_WIN, TEST_WSL_CACHE_ROOT_LINUX } from "@/services/exec/wsl/constants.test";
import { createTestWslUnc } from "@/services/exec/wsl/createTestWslUnc.test";
import { getSourceMirrorKey } from "@/services/exec/wsl/getSourceMirrorKey";
import { getWslSourceMirrorEntryUnc } from "@/services/exec/wsl/getWslSourceMirrorEntryUnc";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/exec/wsl/getWslNativeCacheRoot"), () => ({
  getWslNativeCacheRoot: () => createTestWslUnc(TEST_WSL_CACHE_ROOT_LINUX),
}));

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
