import { subtractTypeBenchCounts } from "#src/services/benchTypes/subtractTypeBenchCounts";
import { describe, expect, test } from "vitest";

describe(subtractTypeBenchCounts, () => {
  test("a case's counts less the baseline's, per count", () => {
    expect.hasAssertions();

    expect(subtractTypeBenchCounts({ instantiations: 10, types: 7 }, { instantiations: 4, types: 2 })).toStrictEqual({
      instantiations: 6,
      types: 5,
    });
  });
});
