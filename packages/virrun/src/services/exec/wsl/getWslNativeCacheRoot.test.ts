import type { execFileSync as baseExecFileSync } from "node:child_process";

import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { VIRRUN_CACHE_HOME_KEY, WSL_CACHE_ROOT_CACHE_FILENAME } from "@/services/exec/util/constants";
import { getHostFingerprint } from "@/services/exec/util/getHostFingerprint";
import {
  TEST_WSL_CACHE_ROOT_LINUX,
  TEST_WSL_DISTRO,
  TEST_WSL_DISTRO_SECONDARY,
  TEST_WSL_HOME,
} from "@/services/exec/wsl/constants.test";
import { createTestWslUnc } from "@/services/exec/wsl/createTestWslUnc.test";
import { writeWslEnvironmentCache } from "@/services/exec/wsl/writeWslEnvironmentCache";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { execFileSync } = vi.hoisted(() => ({ execFileSync: vi.fn<typeof baseExecFileSync>() }));

vi.mock(import("node:child_process"), () => ({ execFileSync: execFileSync as unknown as typeof baseExecFileSync }));
// The distro list is the `-l -q` call; everything else is the `echo $HOME` call.
const mockWsl = (distro: string, home: string) =>
  execFileSync.mockImplementation((_file, args) => (args?.includes("-l") ? distro : home));

describe("getWslNativeCacheRoot", () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  // `wsl.exe -l -q` lists installed distros default-first; only the first non-empty line is taken.
  const distroList = `${TEST_WSL_DISTRO}\n${TEST_WSL_DISTRO_SECONDARY}\n`;
  const cacheRoot = createTestWslUnc(TEST_WSL_CACHE_ROOT_LINUX);
  let cacheHome = "";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    // Isolate the persisted cross-process cache in a fresh temp dir so a real ~/.virrun never leaks into a case.
    cacheHome = create();
    process.env[VIRRUN_CACHE_HOME_KEY] = cacheHome;
  });

  afterEach(() => {
    delete process.env[VIRRUN_CACHE_HOME_KEY];
    cleanup();
  });

  test("builds the UNC cache root from the default distro and its home, memoizes, then persists it", async () => {
    expect.hasAssertions();

    mockWsl(distroList, `${TEST_WSL_HOME}\n`);
    const { getWslNativeCacheRoot } = await import("@/services/exec/wsl/getWslNativeCacheRoot");

    expect(getWslNativeCacheRoot()).toBe(cacheRoot);
    expect(getWslNativeCacheRoot()).toBe(cacheRoot);
    expect(execFileSync).toHaveBeenCalledTimes(2);
    expect(existsSync(join(cacheHome, WSL_CACHE_ROOT_CACHE_FILENAME))).toBe(true);
  });

  test("reuses the persisted cache root across processes without re-probing", async () => {
    expect.hasAssertions();

    writeWslEnvironmentCache(WSL_CACHE_ROOT_CACHE_FILENAME, { key: getHostFingerprint(), value: cacheRoot });
    mockWsl(distroList, `${TEST_WSL_HOME}\n`);
    const { getWslNativeCacheRoot } = await import("@/services/exec/wsl/getWslNativeCacheRoot");

    expect(getWslNativeCacheRoot()).toBe(cacheRoot);
    expect(execFileSync).toHaveBeenCalledTimes(0);
  });

  test("throws when the distro cannot be resolved", async () => {
    expect.hasAssertions();

    mockWsl("", `${TEST_WSL_HOME}\n`);
    const { getWslNativeCacheRoot } = await import("@/services/exec/wsl/getWslNativeCacheRoot");

    expect(() => getWslNativeCacheRoot()).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, getWslNativeCacheRoot.name, "could not resolve the WSL distro or home directory").message}]`,
    );
  });

  test("throws when the home directory cannot be resolved", async () => {
    expect.hasAssertions();

    mockWsl(distroList, "");
    const { getWslNativeCacheRoot } = await import("@/services/exec/wsl/getWslNativeCacheRoot");

    expect(() => getWslNativeCacheRoot()).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, getWslNativeCacheRoot.name, "could not resolve the WSL distro or home directory").message}]`,
    );
  });

  test("does not persist a failed probe", async () => {
    expect.hasAssertions();

    mockWsl("", `${TEST_WSL_HOME}\n`);
    const { getWslNativeCacheRoot } = await import("@/services/exec/wsl/getWslNativeCacheRoot");

    expect(() => getWslNativeCacheRoot()).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, getWslNativeCacheRoot.name, "could not resolve the WSL distro or home directory").message}]`,
    );
    expect(existsSync(join(cacheHome, WSL_CACHE_ROOT_CACHE_FILENAME))).toBe(false);
  });
});
