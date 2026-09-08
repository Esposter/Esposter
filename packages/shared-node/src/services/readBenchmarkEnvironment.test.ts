import type { CpuInfo } from "node:os";

import { readBenchmarkEnvironment } from "#src/services/readBenchmarkEnvironment";
import { cpus } from "node:os";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("node:os"), async (importOriginal) => ({
  ...(await importOriginal<typeof import("node:os")>()),
  cpus: vi.fn<typeof cpus>(),
}));

describe(readBenchmarkEnvironment, () => {
  test("trims the width padding a platform reports its cpu model with", () => {
    expect.hasAssertions();

    const core: CpuInfo = {
      model: "AMD Ryzen 7 7730U with Radeon Graphics          ",
      speed: 0,
      times: { idle: 0, irq: 0, nice: 0, sys: 0, user: 0 },
    };
    vi.mocked(cpus).mockReturnValue([core, core]);
    // The line rather than the whole block: everything around it is the host and the clock, so only this one is
    // Knowable. Padding here would make every artifact this host writes diff against the last for no reason.
    const cpuLine = readBenchmarkEnvironment()
      .split("\n")
      .find((line) => line.startsWith("- CPU: "));

    expect(cpuLine).toBe("- CPU: AMD Ryzen 7 7730U with Radeon Graphics × 2");
  });
});
