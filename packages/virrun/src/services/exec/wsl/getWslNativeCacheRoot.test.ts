import type { execFileSync as baseExecFileSync } from "node:child_process";

import { beforeEach, describe, expect, test, vi } from "vitest";

const { execFileSync } = vi.hoisted(() => ({ execFileSync: vi.fn<typeof baseExecFileSync>() }));

vi.mock(import("node:child_process"), () => ({ execFileSync: execFileSync as unknown as typeof baseExecFileSync }));

// The distro list is the `-l -q` call; everything else is the `echo $HOME` call.
const mockWsl = (distro: string, home: string) =>
  execFileSync.mockImplementation(((_file, args) =>
    Array.isArray(args) && args.includes("-l") ? distro : home) as typeof baseExecFileSync);

describe("getWslNativeCacheRoot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  test("builds the UNC cache root from the default distro and its home, then memoizes", async () => {
    expect.hasAssertions();

    mockWsl("Ubuntu\nDebian\n", "/home/jimmyc\n");
    const { getWslNativeCacheRoot } = await import("@/services/exec/wsl/getWslNativeCacheRoot");

    expect(getWslNativeCacheRoot()).toBe(String.raw`\\wsl.localhost\Ubuntu\home\jimmyc\.virrun`);
    expect(getWslNativeCacheRoot()).toBe(String.raw`\\wsl.localhost\Ubuntu\home\jimmyc\.virrun`);
    expect(execFileSync).toHaveBeenCalledTimes(2);
  });

  test("throws when the distro cannot be resolved", async () => {
    expect.hasAssertions();

    mockWsl("", "/home/jimmyc\n");
    const { getWslNativeCacheRoot } = await import("@/services/exec/wsl/getWslNativeCacheRoot");

    expect(() => getWslNativeCacheRoot()).toThrow("could not resolve the WSL distro or home directory");
  });

  test("throws when the home directory cannot be resolved", async () => {
    expect.hasAssertions();

    mockWsl("Ubuntu\n", "");
    const { getWslNativeCacheRoot } = await import("@/services/exec/wsl/getWslNativeCacheRoot");

    expect(() => getWslNativeCacheRoot()).toThrow("could not resolve the WSL distro or home directory");
  });
});
