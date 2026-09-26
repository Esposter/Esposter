import type { execFileSync as baseExecFileSync } from "node:child_process";

import { probeOsBackendSupported } from "#src/services/exec/os/probeOsBackendSupported";
import { setupPlatformStub } from "#src/services/exec/test/setupPlatformStub.test";
import { describe, expect, test, vi } from "vitest";

const { execFileSync } = vi.hoisted(() => ({ execFileSync: vi.fn<typeof baseExecFileSync>() }));

vi.mock(import("node:child_process"), () => ({ execFileSync: execFileSync as unknown as typeof baseExecFileSync }));

// The probe shells out to bwrap on Linux and through wsl.exe on win32; drive each outcome through the mocked
// Child_process to pin the verdict mapping directly, without depending on the host's real overlay capability.
describe(probeOsBackendSupported, () => {
  const stubPlatform = setupPlatformStub();

  test("is true when the bwrap overlay probe mounts", () => {
    expect.hasAssertions();

    stubPlatform("linux");
    execFileSync.mockReturnValue(Buffer.from(""));

    expect(probeOsBackendSupported()).toBe(true);
  });

  test("is false when the bwrap overlay probe fails to mount", () => {
    expect.hasAssertions();

    stubPlatform("linux");
    execFileSync.mockImplementation(() => {
      throw new Error(" ");
    });

    expect(probeOsBackendSupported()).toBe(false);
  });

  // The bound elapsing is not a verdict on the host — node reports the kill as the signal it sent — so the probe
  // Answers "not answered" rather than false, which is what keeps checkIsOsBackendSupported from caching a cold WSL
  // Distro (or any busy host) as permanently sandbox-incapable for the cache window.
  test("is undefined when the probe's own timeout kills it", () => {
    expect.hasAssertions();

    stubPlatform("linux");
    execFileSync.mockImplementation(() => {
      throw Object.assign(new Error(" "), { signal: "SIGTERM" });
    });

    expect(probeOsBackendSupported()).toBeUndefined();
  });

  // A VM that will not start fails the first wsl.exe round-trip outright, with no kill signal — still no verdict on
  // Bwrap, or the cache would hold the host native for its whole window after WSL recovers
  test("is undefined on win32 when WSL itself cannot start", () => {
    expect.hasAssertions();

    stubPlatform("win32");
    execFileSync.mockImplementation(() => {
      throw new Error(" ");
    });

    expect(probeOsBackendSupported()).toBeUndefined();
  });

  test("is false on win32 when WSL answers but the bwrap overlay fails to mount", () => {
    expect.hasAssertions();

    stubPlatform("win32");
    execFileSync.mockImplementation((_file, args) => {
      if (args?.includes("bwrap")) throw new Error(" ");
      return Buffer.from("/");
    });

    expect(probeOsBackendSupported()).toBe(false);
  });
});
