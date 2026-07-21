import { getSandboxNodeVersion } from "@/services/exec/util/getSandboxNodeVersion";
import { readWslExecNodeVersion } from "@/services/exec/wsl/readWslExecNodeVersion";
import { readWslLoginEnvironment } from "@/services/exec/wsl/readWslLoginEnvironment";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/exec/wsl/readWslExecNodeVersion"), () => ({
  readWslExecNodeVersion: vi.fn<typeof readWslExecNodeVersion>(() => ""),
}));
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

  test("probes the guest's default-PATH node on win32 when the capture yields no PATH to inject", () => {
    expect.hasAssertions();

    // The degraded run injects no PATH, so it runs whatever node `wsl.exe --exec` resolves — never the capture's node,
    // Which would key an installed node_modules under a major the sandbox does not run.
    setPlatform("win32");
    vi.mocked(readWslLoginEnvironment).mockReturnValueOnce({ nodeVersion: "v27.0.0", path: "" });
    vi.mocked(readWslExecNodeVersion).mockReturnValueOnce(nodeVersion);

    expect(getSandboxNodeVersion()).toBe(nodeVersion);
  });

  test("reports the host node off win32, where the sandbox inherits the caller's toolchain", () => {
    expect.hasAssertions();

    setPlatform("linux");

    expect(getSandboxNodeVersion()).toBe(process.version);
  });
});
