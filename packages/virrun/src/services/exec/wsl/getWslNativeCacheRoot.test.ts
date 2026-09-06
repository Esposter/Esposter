import type { execFileSync as baseExecFileSync } from "node:child_process";

import { setupTemporaryCacheHome } from "#src/services/exec/test/setupTemporaryCacheHome.test";
import { WSL_CACHE_ROOT_CACHE_FILENAME } from "#src/services/exec/util/constants";
import { getHostFingerprint } from "#src/services/exec/util/getHostFingerprint";
import {
  TEST_WSL_CACHE_ROOT_LINUX,
  TEST_WSL_DISTRO,
  TEST_WSL_DISTRO_SECONDARY,
  TEST_WSL_HOME,
} from "#src/services/exec/wsl/constants.test";
import { createTestWslUnc } from "#src/services/exec/wsl/createTestWslUnc.test";
import { writeWslEnvironmentCache } from "#src/services/exec/wsl/writeWslEnvironmentCache";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { execFileSync } = vi.hoisted(() => ({ execFileSync: vi.fn<typeof baseExecFileSync>() }));

vi.mock(import("node:child_process"), () => ({ execFileSync: execFileSync as unknown as typeof baseExecFileSync }));
// The distro list is the `-l -q` call; everything else is the `echo $HOME` call.
const mockWsl = (distro: string, home: string) =>
  execFileSync.mockImplementation((_file, args) => (args?.includes("-l") ? distro : home));

describe("getWslNativeCacheRoot", () => {
  // The shared cache-home fixture isolates the persisted cross-process cache per test.
  const { getCacheHome } = setupTemporaryCacheHome();
  // `wsl.exe -l -q` lists installed distros default-first; only the first non-empty line is taken.
  const distroList = `${TEST_WSL_DISTRO}\n${TEST_WSL_DISTRO_SECONDARY}\n`;
  const cacheRoot = createTestWslUnc(TEST_WSL_CACHE_ROOT_LINUX);
  // Either half missing is the same refusal, so the three cases below all reconstruct this one message
  const unresolvedEnvironmentErrorMessage = `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, "getWslNativeCacheRoot", "could not resolve the WSL distro or home directory").message}]`;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  test("builds the UNC cache root from the default distro and its home, memoizes, then persists it", async () => {
    expect.hasAssertions();

    mockWsl(distroList, `${TEST_WSL_HOME}\n`);
    const { getWslNativeCacheRoot } = await import("#src/services/exec/wsl/getWslNativeCacheRoot");

    expect(getWslNativeCacheRoot()).toBe(cacheRoot);
    expect(getWslNativeCacheRoot()).toBe(cacheRoot);
    expect(execFileSync).toHaveBeenCalledTimes(2);
    expect(existsSync(join(getCacheHome(), WSL_CACHE_ROOT_CACHE_FILENAME))).toBe(true);
  });

  test("reuses the persisted cache root across processes without re-probing", async () => {
    expect.hasAssertions();

    writeWslEnvironmentCache(WSL_CACHE_ROOT_CACHE_FILENAME, { key: getHostFingerprint(), value: cacheRoot });
    mockWsl(distroList, `${TEST_WSL_HOME}\n`);
    const { getWslNativeCacheRoot } = await import("#src/services/exec/wsl/getWslNativeCacheRoot");

    expect(getWslNativeCacheRoot()).toBe(cacheRoot);
    expect(execFileSync).not.toHaveBeenCalled();
  });

  test("throws when the home directory cannot be resolved", async () => {
    expect.hasAssertions();

    mockWsl(distroList, "");
    const { getWslNativeCacheRoot } = await import("#src/services/exec/wsl/getWslNativeCacheRoot");

    expect(() => getWslNativeCacheRoot()).toThrowErrorMatchingInlineSnapshot(unresolvedEnvironmentErrorMessage);
  });

  // A failed probe throws AND leaves nothing behind: persisting it would pin every later process to a refusal
  test("throws when the distro cannot be resolved, and does not persist the failed probe", async () => {
    expect.hasAssertions();

    mockWsl("", `${TEST_WSL_HOME}\n`);
    const { getWslNativeCacheRoot } = await import("#src/services/exec/wsl/getWslNativeCacheRoot");

    expect(() => getWslNativeCacheRoot()).toThrowErrorMatchingInlineSnapshot(unresolvedEnvironmentErrorMessage);
    expect(existsSync(join(getCacheHome(), WSL_CACHE_ROOT_CACHE_FILENAME))).toBe(false);
  });
});
