import { orderLandmarks } from "#src/services/genshinAssets/shared/orderLandmarks";
import { describe, expect, test } from "vitest";

describe(orderLandmarks, () => {
  const SORTED = [{ id: "1" }, { id: "5" }, { id: "10" }];

  test("landmarks come out in one order whatever order they are listed in", () => {
    expect.hasAssertions();

    expect(orderLandmarks([{ id: "10" }, { id: "5" }, { id: "1" }])).toStrictEqual(SORTED);
    expect(orderLandmarks(SORTED.toReversed())).toStrictEqual(SORTED);
    expect(orderLandmarks([{ id: "5" }, { id: "05" }])).toStrictEqual([{ id: "05" }, { id: "5" }]);
    expect(orderLandmarks([{ id: "05" }, { id: "5" }])).toStrictEqual([{ id: "05" }, { id: "5" }]);
  });
});
