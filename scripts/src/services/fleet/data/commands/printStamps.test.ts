import { printStamps } from "#src/services/fleet/data/commands/printStamps";
import { STAMP_CONCURRENCY } from "#src/services/fleet/data/constants";
import { PROVENANCE_NAME } from "#src/services/provenance/constants";
import { readStamp } from "#src/services/provenance/readStamp";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/provenance/readStamp"), () => ({ readStamp: vi.fn<typeof readStamp>() }));

describe(printStamps, () => {
  test("reads no more stamps at once than the concurrency bound", async () => {
    expect.hasAssertions();

    const PARITY_DIRECTORY = "a";
    const PATH_COUNT = STAMP_CONCURRENCY * 2;
    const paths = Array.from({ length: PATH_COUNT }, (_value, index) => `${index}/${PROVENANCE_NAME}`);
    let inFlight = 0;
    let peak = 0;
    vi.mocked(readStamp).mockImplementation(async () => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      // Yields once, so a read stays in flight while the reads after it start
      await Promise.resolve();
      inFlight--;
      return undefined;
    });

    await printStamps(PARITY_DIRECTORY, paths);

    expect(peak).toBeLessThanOrEqual(STAMP_CONCURRENCY);
  });
});
