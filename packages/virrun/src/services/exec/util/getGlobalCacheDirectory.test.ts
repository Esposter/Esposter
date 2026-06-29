import { VIRRUN_CACHE_DIRECTORY_NAME, VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { homedir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";

const WSL_NATIVE_CACHE_ROOT = String.raw`\\wsl.localhost\Ubuntu\home\jimmyc\.virrun`;
// On win32 the default routes to the WSL distro's ext4 home (which really spawns wsl.exe); stub it so the test
// Stays hermetic and platform-independent.
vi.mock(import("@/services/exec/wsl/getWslNativeCacheRoot"), () => ({
  getWslNativeCacheRoot: () => WSL_NATIVE_CACHE_ROOT,
}));

describe(getGlobalCacheDirectory, () => {
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

    process.env[VIRRUN_CACHE_HOME_KEY] = join(homedir(), "custom-cache");

    expect(getGlobalCacheDirectory()).toBe(join(homedir(), "custom-cache"));
  });
});
