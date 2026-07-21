import type { execFileSync as baseExecFileSync } from "node:child_process";

import { setupTemporaryCacheHome } from "@/services/exec/test/setupTemporaryCacheHome.test";
import { PROBE_TIMEOUT_MS, WSL_EXEC_NODE_VERSION_CACHE_FILENAME } from "@/services/exec/util/constants";
import { getHostFingerprint } from "@/services/exec/util/getHostFingerprint";
import { writeWslEnvironmentCache } from "@/services/exec/wsl/writeWslEnvironmentCache";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { execFileSync } = vi.hoisted(() => ({ execFileSync: vi.fn<typeof baseExecFileSync>() }));

vi.mock(import("node:child_process"), () => ({ execFileSync: execFileSync as unknown as typeof baseExecFileSync }));

describe("readWslExecNodeVersion", () => {
  // The shared cache-home fixture isolates the persisted cross-process cache per test.
  const { getCacheHome } = setupTemporaryCacheHome();
  const nodeVersion = "v26.5.0";

  beforeEach(() => {
    // Reset the module so its memoized probe does not leak between cases, and seed the default probe output.
    vi.resetModules();
    execFileSync.mockReset();
    execFileSync.mockReturnValue(`${nodeVersion}\n`);
  });

  test("trims the guest's default-PATH node version, memoizes it, and persists the probe", async () => {
    expect.hasAssertions();

    const { readWslExecNodeVersion } = await import("@/services/exec/wsl/readWslExecNodeVersion");

    expect(readWslExecNodeVersion()).toBe(nodeVersion);
    expect(readWslExecNodeVersion()).toBe(nodeVersion);
    expect(execFileSync).toHaveBeenCalledExactlyOnceWith("wsl.exe", ["--exec", "node", "--version"], {
      encoding: "buffer",
      stdio: "pipe",
      timeout: PROBE_TIMEOUT_MS,
      windowsHide: true,
    });
    expect(existsSync(join(getCacheHome(), WSL_EXEC_NODE_VERSION_CACHE_FILENAME))).toBe(true);
  });

  test("reuses the persisted probe across processes without re-probing", async () => {
    expect.hasAssertions();

    writeWslEnvironmentCache(WSL_EXEC_NODE_VERSION_CACHE_FILENAME, { key: getHostFingerprint(), value: nodeVersion });
    const { readWslExecNodeVersion } = await import("@/services/exec/wsl/readWslExecNodeVersion");

    expect(readWslExecNodeVersion()).toBe(nodeVersion);
    expect(execFileSync).toHaveBeenCalledTimes(0);
  });

  test("re-probes when the persisted probe has aged out — the toolchain switch the host key cannot see", async () => {
    expect.hasAssertions();

    // A capture stamped long ago under this very host key: a snapshot holds an installed node_modules, so replaying
    // One under another ABI is not a cache hit but a wrong answer.
    writeFileSync(
      join(getCacheHome(), WSL_EXEC_NODE_VERSION_CACHE_FILENAME),
      JSON.stringify({ key: getHostFingerprint(), storedAtMs: 0, value: "v26.4.0" }),
    );
    const { readWslExecNodeVersion } = await import("@/services/exec/wsl/readWslExecNodeVersion");

    expect(readWslExecNodeVersion()).toBe(nodeVersion);
    expect(execFileSync).toHaveBeenCalledTimes(1);
  });

  test("degrades to an empty version when WSL is unavailable", async () => {
    expect.hasAssertions();

    execFileSync.mockImplementation(() => {
      throw new Error("wsl.exe not found");
    });
    const { readWslExecNodeVersion } = await import("@/services/exec/wsl/readWslExecNodeVersion");

    expect(readWslExecNodeVersion()).toBe("");
  });

  test("does not persist a failed probe", async () => {
    expect.hasAssertions();

    execFileSync.mockReturnValue("");
    const { readWslExecNodeVersion } = await import("@/services/exec/wsl/readWslExecNodeVersion");
    readWslExecNodeVersion();

    expect(existsSync(join(getCacheHome(), WSL_EXEC_NODE_VERSION_CACHE_FILENAME))).toBe(false);
  });
});
