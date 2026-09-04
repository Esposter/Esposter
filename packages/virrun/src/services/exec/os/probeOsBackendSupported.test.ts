import type { execFileSync as baseExecFileSync } from "node:child_process";

import { probeOsBackendSupported } from "#src/services/exec/os/probeOsBackendSupported";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { execFileSync } = vi.hoisted(() => ({
  execFileSync: vi.fn<typeof baseExecFileSync>(),
}));

vi.mock(import("node:child_process"), () => ({
  execFileSync: execFileSync as unknown as typeof baseExecFileSync,
}));

// The probe shells out to bwrap on Linux; drive its two outcomes through the mocked child_process to pin the
// Success/failure mapping directly, without depending on the host's real overlay capability. Gated to linux since the
// Win32 branch dispatches through wsl.exe (exercised by the WSL suites) and every other platform short-circuits to
// False before touching child_process.
describe.skipIf(process.platform !== "linux")(probeOsBackendSupported, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("is true when the bwrap overlay probe mounts", () => {
    expect.hasAssertions();

    execFileSync.mockReturnValue(Buffer.from(""));

    expect(probeOsBackendSupported()).toBe(true);
  });

  test("is false when the bwrap overlay probe fails to mount", () => {
    expect.hasAssertions();

    execFileSync.mockImplementation(() => {
      throw new Error("bwrap: Can't make overlay mount ... userxattr: Invalid argument");
    });

    expect(probeOsBackendSupported()).toBe(false);
  });

  // The bound elapsing is not a verdict on the host — node reports the kill as the signal it sent — so the probe
  // Answers "not answered" rather than false, which is what keeps isOsBackendSupported from caching a cold WSL
  // Distro (or any busy host) as permanently sandbox-incapable for the cache window.
  test("is undefined when the probe's own timeout kills it", () => {
    expect.hasAssertions();

    execFileSync.mockImplementation(() => {
      throw Object.assign(new Error("spawnSync bwrap ETIMEDOUT"), { signal: "SIGTERM" });
    });

    expect(probeOsBackendSupported()).toBeUndefined();
  });
});
