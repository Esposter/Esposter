import { checkIsVirrunEnabled } from "#src/services/configuration/checkIsVirrunEnabled";
import { checkIsOsBackendSupported } from "#src/services/exec/os/checkIsOsBackendSupported";
import { probeOsBackendSupported } from "#src/services/exec/os/probeOsBackendSupported";
import { describe, expect, test } from "vitest";

describe(checkIsOsBackendSupported, () => {
  // `checkIsOsBackendSupported` layers a nesting guard + in-process memo + persisted cache over the raw host probe, so
  // Derive the expected verdict from the SAME two inputs the wrapper reads — the raw overlay probe and the VIRRUN
  // Nesting signal. The two assertions are complementary (exactly one runs per environment: a capable un-nested dev
  // Box, a bare CI runner, a WSL2 build without overlayfs, or a nested `virrun -- vitest`), which pins the wrapper
  // Against the probe without re-mirroring the bwrap/wsl.exe argv the probe already owns. The nested guard is a hard
  // Gate, not a probe outcome: some kernels happily overlay the already-overlaid cwd, yet the backend still can't run
  // Nested (its persist/snapshot writes hit the outer read-only ~/.virrun), so the wrapper degrades on the VIRRUN
  // Signal regardless of what the probe reports.
  const isCapableUnnestedHost = Boolean(probeOsBackendSupported()) && !checkIsVirrunEnabled(process.env);

  test.skipIf(!isCapableUnnestedHost)("is true on a capable, un-nested host", () => {
    expect.hasAssertions();

    expect(checkIsOsBackendSupported()).toBe(true);
  });

  test.skipIf(isCapableUnnestedHost)("is false on an incapable or nested host", () => {
    expect.hasAssertions();

    expect(checkIsOsBackendSupported()).toBe(false);
  });
});
