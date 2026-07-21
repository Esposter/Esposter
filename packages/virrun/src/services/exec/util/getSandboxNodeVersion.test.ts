import { setupTemporaryCacheHome } from "@/services/exec/test/setupTemporaryCacheHome.test";
import { WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME } from "@/services/exec/util/constants";
import { getHostFingerprint } from "@/services/exec/util/getHostFingerprint";
import { getSandboxNodeVersion } from "@/services/exec/util/getSandboxNodeVersion";
import { readWslExecNodeVersion } from "@/services/exec/wsl/readWslExecNodeVersion";
import { writeWslEnvironmentCache } from "@/services/exec/wsl/writeWslEnvironmentCache";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/exec/wsl/readWslExecNodeVersion"), () => ({ readWslExecNodeVersion: vi.fn(() => "") }));

const setPlatform = (value: string) => {
  Object.defineProperty(process, "platform", { configurable: true, value });
};

describe(getSandboxNodeVersion, () => {
  setupTemporaryCacheHome();
  const nodeVersion = "v26.5.0";
  const { platform } = process;

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

  test("probes the guest's default-PATH node on win32 when no capture has been persisted yet", () => {
    expect.hasAssertions();

    // The degraded run injects no PATH, so it runs whatever node `wsl.exe --exec` resolves — never this process's
    // Windows node, which would key an installed node_modules under a major the sandbox does not run.
    setPlatform("win32");
    vi.mocked(readWslExecNodeVersion).mockReturnValueOnce(nodeVersion);

    expect(getSandboxNodeVersion()).toBe(nodeVersion);
  });

  test("reports the host node off win32, where the sandbox inherits the caller's toolchain", () => {
    expect.hasAssertions();

    setPlatform("linux");

    expect(getSandboxNodeVersion()).toBe(process.version);
  });
});
