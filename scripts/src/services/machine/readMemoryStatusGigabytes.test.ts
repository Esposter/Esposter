import { GIBIBYTE } from "#src/services/machine/constants";
import { readMemoryStatusGigabytes } from "#src/services/machine/readMemoryStatusGigabytes";
import { runMachineCommand } from "#src/services/machine/runMachineCommand";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/machine/runMachineCommand"), () => ({
  runMachineCommand: vi.fn<(file: string, args: string[]) => Promise<string>>(),
}));

vi.mock(import("node:os"), async (importOriginal) => ({ ...(await importOriginal()), totalmem: () => 16 * GIBIBYTE }));

describe(readMemoryStatusGigabytes, () => {
  test("the system's sysctl runs from /usr/sbin on macos", async () => {
    expect.hasAssertions();

    vi.mocked(runMachineCommand).mockResolvedValue("50");

    // A 50 percent share of 16 GiB
    await expect(readMemoryStatusGigabytes()).resolves.toBe(8);
    expect(runMachineCommand).toHaveBeenCalledExactlyOnceWith("/usr/sbin/sysctl", ["-n", "kern.memorystatus_level"]);
  });
});
