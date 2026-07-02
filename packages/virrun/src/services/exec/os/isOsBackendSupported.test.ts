import { isVirrunEnabled } from "@/services/configuration/isVirrunEnabled";
import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
import { probeOsBackendSupported } from "@/services/exec/os/probeOsBackendSupported";
import { describe, expect, test } from "vitest";

// IsOsBackendSupported layers a nesting guard + in-process memo + persisted cache over the raw host probe, so derive
// The expected verdict from the SAME two inputs the wrapper reads — the raw overlay probe and the VIRRUN nesting
// Signal. The two assertions are complementary (exactly one runs per environment: a capable un-nested dev box, a bare
// CI runner, a WSL2 build without overlayfs, or a nested `virrun -- vitest`), which pins the wrapper against the probe
// Without re-mirroring the bwrap/wsl.exe argv the probe already owns. The nested guard is a hard gate, not a probe
// Outcome: some kernels happily overlay the already-overlaid cwd, yet the backend still can't run nested (its
// Persist/snapshot writes hit the outer read-only ~/.virrun), so the wrapper degrades on the VIRRUN signal regardless
// Of what the probe reports.
const isHostCapable = probeOsBackendSupported();
const isNested = isVirrunEnabled(process.env);

describe(isOsBackendSupported, () => {
  test.skipIf(!(isHostCapable && !isNested))("is true on a capable, un-nested host", () => {
    expect.hasAssertions();

    expect(isOsBackendSupported()).toBe(true);
  });

  test.skipIf(isHostCapable && !isNested)("is false on an incapable or nested host", () => {
    expect.hasAssertions();

    expect(isOsBackendSupported()).toBe(false);
  });
});
