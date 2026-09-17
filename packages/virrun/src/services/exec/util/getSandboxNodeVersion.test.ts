import { setupPlatformStub } from "#src/services/exec/test/setupPlatformStub.test";
import { getSandboxNodeVersion } from "#src/services/exec/util/getSandboxNodeVersion";
import { TEST_WSL_LOGIN_ENVIRONMENT } from "#src/services/exec/wsl/constants.test";
import { readWslLoginEnvironment } from "#src/services/exec/wsl/readWslLoginEnvironment";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/exec/wsl/readWslLoginEnvironment"), () => ({
  readWslLoginEnvironment: vi.fn<typeof readWslLoginEnvironment>(() => ({
    nodeDirectory: "",
    nodeVersion: "",
    path: "",
  })),
}));

describe(getSandboxNodeVersion, () => {
  const stubPlatform = setupPlatformStub();

  test("reports the WSL guest's node on win32 — the sandbox runs that one, not this process's", () => {
    expect.hasAssertions();

    stubPlatform("win32");
    vi.mocked(readWslLoginEnvironment).mockReturnValueOnce(TEST_WSL_LOGIN_ENVIRONMENT);

    expect(getSandboxNodeVersion()).toBe(TEST_WSL_LOGIN_ENVIRONMENT.nodeVersion);
  });

  // Crossing the capture guard with the cache key: createOsExecOptions refuses to run at all without an injected
  // PATH, so a degraded capture describes no run. Reporting a version anyway keys a snapshot that is never wrong
  // Enough to notice and prunes the warm one on the way to failing the run regardless — computeEnvironmentKey
  // Throws on "" instead, before any sweep.
  test("reports nothing on win32 when the capture yields no PATH to inject", () => {
    expect.hasAssertions();

    stubPlatform("win32");
    vi.mocked(readWslLoginEnvironment).mockReturnValueOnce({ ...TEST_WSL_LOGIN_ENVIRONMENT, path: "" });

    expect(getSandboxNodeVersion()).toBe("");
  });

  test("reports nothing on win32 when the capture names no node", () => {
    expect.hasAssertions();

    stubPlatform("win32");
    vi.mocked(readWslLoginEnvironment).mockReturnValueOnce({
      ...TEST_WSL_LOGIN_ENVIRONMENT,
      nodeDirectory: "",
      nodeVersion: "",
    });

    expect(getSandboxNodeVersion()).toBe("");
  });

  test("reports the host node off win32, where the sandbox inherits the caller's toolchain", () => {
    expect.hasAssertions();

    stubPlatform("linux");

    expect(getSandboxNodeVersion()).toBe(process.version);
  });
});
