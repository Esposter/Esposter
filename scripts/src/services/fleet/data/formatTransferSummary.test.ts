import { formatTransferSummary } from "#src/services/fleet/data/formatTransferSummary";
import { describe, expect, test } from "vitest";

describe(formatTransferSummary, () => {
  test("states the file count, the bytes in mebibytes, the duration and the throughput", () => {
    expect.hasAssertions();

    expect(formatTransferSummary(3, 2 * 2 ** 20, 4000)).toBe("3 files, 2.0 MiB in 4.0 s, 0.5 MiB/s");
  });
});
