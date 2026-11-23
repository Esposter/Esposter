import { BATCH_FILE_EXTENSION } from "#src/services/sweeps/ledgerCoverage/constants";
import { formatBatchFileName } from "#src/services/sweeps/ledgerCoverage/formatBatchFileName";
import { compareText } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(formatBatchFileName, () => {
  test("names a run of more than ninety-nine batches so the names sort in the order they were cut", () => {
    expect.hasAssertions();

    const count = 120;
    const names = Array.from({ length: count }, (_value, index) =>
      formatBatchFileName(index, count, BATCH_FILE_EXTENSION),
    );

    expect(names.toSorted(compareText)).toStrictEqual(names);
  });
});
