import { setupTemporaryCacheHome } from "@/services/exec/test/setupTemporaryCacheHome.test";
import { WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME } from "@/services/exec/util/constants";
import { getHostFingerprint } from "@/services/exec/util/getHostFingerprint";
import { getSandboxNodeVersion } from "@/services/exec/util/getSandboxNodeVersion";
import { writeWslEnvironmentCache } from "@/services/exec/wsl/writeWslEnvironmentCache";
import { afterEach, describe, expect, test } from "vitest";

describe(getSandboxNodeVersion, () => {
  setupTemporaryCacheHome();
  const nodeVersion = "v26.5.0";
  const { platform } = process;

  const setPlatform = (value: string) => {
    Object.defineProperty(process, "platform", { configurable: true, value });
  };

  afterEach(() => {
    setPlatform(platform);
  });

  test("reports the WSL guest's node on win32 — the sandbox runs that one, not this process's", () => {
    expect.hasAssertions();

    setPlatform("win32");
    writeWslEnvironmentCache(WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME, {
      key: getHostFingerprint(),
      value: { nodeVersion, path: "/usr/bin" },
    });

    expect(getSandboxNodeVersion()).toBe(nodeVersion);
  });

  test("falls back to the host node on win32 when no capture has been persisted yet", () => {
    expect.hasAssertions();

    // Deliberately never probes: this feeds every run's cache key, so a missing capture degrades rather than paying a
    // Login-shell spawn to label one.
    setPlatform("win32");

    expect(getSandboxNodeVersion()).toBe(process.version);
  });

  test("reports the host node off win32, where the sandbox inherits the caller's toolchain", () => {
    expect.hasAssertions();

    setPlatform("linux");

    expect(getSandboxNodeVersion()).toBe(process.version);
  });
});
