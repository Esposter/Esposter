import { AZURE_SELF_DESTRUCT_TIMER } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

import { getReverseTickedMilliseconds } from "#src/services/cutover/tables/getReverseTickedMilliseconds";

describe(getReverseTickedMilliseconds, () => {
  const epochMilliseconds = 1700000000123;

  test("reads the time a reverse-ticked key was made at", () => {
    expect.hasAssertions();
    const reverseTickedTimestamp = (
      BigInt(AZURE_SELF_DESTRUCT_TIMER) -
      BigInt(epochMilliseconds) * 1000000n
    ).toString();

    expect(getReverseTickedMilliseconds(reverseTickedTimestamp)).toBe(epochMilliseconds);
  });
});
