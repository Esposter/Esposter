import { readMemoryStatusGigabytes } from "#src/services/machine/readMemoryStatusGigabytes";
import { runMachineCommand } from "#src/services/machine/runMachineCommand";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/machine/runMachineCommand"), () => ({
  runMachineCommand: vi.fn<(file: string, args: string[]) => Promise<string>>(),
}));

describe(readMemoryStatusGigabytes, () => {
  test("the system's sysctl runs from /usr/sbin on macos", async () => {
    expect.hasAssertions();

    vi.mocked(runMachineCommand).mockResolvedValue("50");
    await readMemoryStatusGigabytes();

    expect(runMachineCommand).toHaveBeenCalledExactlyOnceWith("/usr/sbin/sysctl", ["-n", "kern.memorystatus_level"]);
  });
});
