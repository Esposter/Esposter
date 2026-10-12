import { ReviewWindowStatus } from "#src/models/review/ReviewWindowStatus";
import { getNewlyPassedWindowIndices } from "#src/services/review/getNewlyPassedWindowIndices";
import { describe, expect, test } from "vitest";

describe(getNewlyPassedWindowIndices, () => {
  const { Failed, Passed } = ReviewWindowStatus;

  test("returns the windows that passed past the handled count, up to the first unsettled one", () => {
    expect.hasAssertions();

    expect(getNewlyPassedWindowIndices([Passed, Passed, undefined, Passed], 1)).toStrictEqual([1]);
  });

  test("returns nothing once a window did not pass", () => {
    expect.hasAssertions();

    expect(getNewlyPassedWindowIndices([Passed, Failed, Passed], 0)).toStrictEqual([0]);
    expect(getNewlyPassedWindowIndices([Passed, Failed, Passed], 1)).toStrictEqual([]);
  });
});
