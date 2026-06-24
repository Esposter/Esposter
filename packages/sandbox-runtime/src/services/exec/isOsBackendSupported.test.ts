import { isOsBackendSupported } from "@/services/exec/isOsBackendSupported";
import { describe, expect, test } from "vitest";

describe(isOsBackendSupported, () => {
  // Windows-runnable: the os backend can never be supported off Linux, regardless of what is on PATH.
  test.skipIf(process.platform === "linux")("is false on non-Linux hosts", () => {
    expect.hasAssertions();

    expect(isOsBackendSupported()).toBe(false);
  });

  // On this Linux box bubblewrap is installed (see roadmap/de-risk), so the probe resolves true.
  test.skipIf(process.platform !== "linux")("is true on Linux with bubblewrap installed", () => {
    expect.hasAssertions();

    expect(isOsBackendSupported()).toBe(true);
  });
});
