import type { execFileSync as baseExecFileSync } from "node:child_process";

import {
  TEST_WSL_CACHE_ROOT_LINUX,
  TEST_WSL_DISTRO,
  TEST_WSL_DISTRO_SECONDARY,
  TEST_WSL_HOME,
} from "@/services/exec/wsl/constants.test";
import { createTestWslUnc } from "@/services/exec/wsl/createTestWslUnc.test";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { execFileSync } = vi.hoisted(() => ({ execFileSync: vi.fn<typeof baseExecFileSync>() }));

vi.mock(import("node:child_process"), () => ({ execFileSync: execFileSync as unknown as typeof baseExecFileSync }));

// The distro list is the `-l -q` call; everything else is the `echo $HOME` call.
const mockWsl = (distro: string, home: string) =>
  execFileSync.mockImplementation(((_file, args) =>
    Array.isArray(args) && args.includes("-l") ? distro : home) as typeof baseExecFileSync);

describe("getWslNativeCacheRoot", () => {
  // `wsl.exe -l -q` lists installed distros default-first; only the first non-empty line is taken.
  const distroList = `${TEST_WSL_DISTRO}\n${TEST_WSL_DISTRO_SECONDARY}\n`;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  test("builds the UNC cache root from the default distro and its home, then memoizes", async () => {
    expect.hasAssertions();

    mockWsl(distroList, `${TEST_WSL_HOME}\n`);
    const { getWslNativeCacheRoot } = await import("@/services/exec/wsl/getWslNativeCacheRoot");

    expect(getWslNativeCacheRoot()).toBe(createTestWslUnc(TEST_WSL_CACHE_ROOT_LINUX));
    expect(getWslNativeCacheRoot()).toBe(createTestWslUnc(TEST_WSL_CACHE_ROOT_LINUX));
    expect(execFileSync).toHaveBeenCalledTimes(2);
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
});
