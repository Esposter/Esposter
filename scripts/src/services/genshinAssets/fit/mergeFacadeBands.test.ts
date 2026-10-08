import { mergeFacadeBands } from "#src/services/genshinAssets/fit/mergeFacadeBands";
import { describe, expect, test } from "vitest";

describe(mergeFacadeBands, () => {
  test("joins bands whose tone holds within the tolerance into one run", () => {
    expect.hasAssertions();

    expect(
      mergeFacadeBands(
        [
          { from: 0, shade: [1, 1, 1], to: 2 },
          { from: 2, shade: [1.01, 1, 1], to: 4 },
        ],
        0.04,
      ),
    ).toStrictEqual([{ from: 0, shade: [1, 1, 1], to: 4 }]);
  });

  test("splits a run where a band's tone leaves the run's first shade behind", () => {
    expect.hasAssertions();

    expect(
      mergeFacadeBands(
        [
          { from: 0, shade: [1, 1, 1], to: 2 },
          { from: 2, shade: [1.03, 1, 1], to: 4 },
          { from: 4, shade: [1.06, 1, 1], to: 6 },
        ],
        0.04,
      ),
    ).toStrictEqual([
      { from: 0, shade: [1, 1, 1], to: 4 },
      { from: 4, shade: [1.06, 1, 1], to: 6 },
    ]);
  });
});
