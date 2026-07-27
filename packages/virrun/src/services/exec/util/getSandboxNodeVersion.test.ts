import { getSandboxNodeVersion } from "@/services/exec/util/getSandboxNodeVersion";
import { readWslLoginEnvironment } from "@/services/exec/wsl/readWslLoginEnvironment";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/exec/wsl/readWslLoginEnvironment"), () => ({
  readWslLoginEnvironment: vi.fn<typeof readWslLoginEnvironment>(() => ({ nodeVersion: "", path: "" })),
}));

const setPlatform = (value: string) => {
  Object.defineProperty(process, "platform", { configurable: true, value });
};

describe(getSandboxNodeVersion, () => {
  const nodeVersion = "v26.5.0";
  const { platform } = process;

  afterEach(() => {
    setPlatform(platform);
  });

  test("reports the WSL guest's node on win32 — the sandbox runs that one, not this process's", () => {
    expect.hasAssertions();

    setPlatform("win32");
    vi.mocked(readWslLoginEnvironment).mockReturnValueOnce({ nodeVersion, path: "/usr/bin" });

    expect(getSandboxNodeVersion()).toBe(nodeVersion);
  });

  // Crossing the capture guard with the cache key: createOsExecOptions refuses to run at all without an injected
  // PATH, so a degraded capture describes no run. Reporting a version anyway keys a snapshot that is never wrong
  // Enough to notice and prunes the warm one on the way to failing the run regardless — computeEnvironmentKey
  // Throws on "" instead, before any sweep.
  test("reports nothing on win32 when the capture yields no PATH to inject", () => {
    expect.hasAssertions();

    setPlatform("win32");
    vi.mocked(readWslLoginEnvironment).mockReturnValueOnce({ nodeVersion: "v27.0.0", path: "" });

    expect(getSandboxNodeVersion()).toBe("");
  });

  test("reports nothing on win32 when the capture names no node", () => {
    expect.hasAssertions();

    setPlatform("win32");
    vi.mocked(readWslLoginEnvironment).mockReturnValueOnce({ nodeVersion: "", path: "/usr/bin" });

    expect(getSandboxNodeVersion()).toBe("");
  });

  test("reports the host node off win32, where the sandbox inherits the caller's toolchain", () => {
    expect.hasAssertions();

    setPlatform("linux");

    expect(getSandboxNodeVersion()).toBe(process.version);
  });
});
