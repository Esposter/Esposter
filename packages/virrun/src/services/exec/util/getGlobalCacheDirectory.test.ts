import { VIRRUN_CACHE_DIRECTORY_NAME, VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { TEST_WSL_CACHE_ROOT_LINUX } from "@/services/exec/wsl/constants.test";
import { createTestWslUnc } from "@/services/exec/wsl/createTestWslUnc.test";
import { homedir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";

const WSL_NATIVE_CACHE_ROOT = createTestWslUnc(TEST_WSL_CACHE_ROOT_LINUX);
// On win32 the default routes to the WSL distro's ext4 home (which really spawns wsl.exe); stub it so the test
// Stays hermetic and platform-independent.
vi.mock(import("@/services/exec/wsl/getWslNativeCacheRoot"), () => ({
  getWslNativeCacheRoot: () => WSL_NATIVE_CACHE_ROOT,
}));

describe(getGlobalCacheDirectory, () => {
  const customCache = join(homedir(), TEST_FILENAME);

  afterEach(() => {
    delete process.env[VIRRUN_CACHE_HOME_KEY];
  });

  test("defaults to the WSL native cache root on win32 and ~/.virrun elsewhere", () => {
    expect.hasAssertions();

    delete process.env[VIRRUN_CACHE_HOME_KEY];

    expect(getGlobalCacheDirectory()).toBe(
      process.platform === "win32" ? WSL_NATIVE_CACHE_ROOT : join(homedir(), VIRRUN_CACHE_DIRECTORY_NAME),
    );
  });

  test("honors the VIRRUN_CACHE_HOME override", () => {
    expect.hasAssertions();

    process.env[VIRRUN_CACHE_HOME_KEY] = customCache;

    expect(getGlobalCacheDirectory()).toBe(customCache);
  });
});
