import { getBasePaginationData } from "@@/server/services/pagination/getBasePaginationData";
import { describe, expect, test } from "vitest";

describe(getBasePaginationData, () => {
  const firstItem = "first";
  const secondItem = "second";

  test("hands back every item when the limit covers them", () => {
    expect.hasAssertions();

    const items = [firstItem];

    expect(getBasePaginationData(items, 1)).toStrictEqual({ hasMore: false, items });
  });

  test("drops the item past the limit and reports there is more", () => {
    expect.hasAssertions();

    expect(getBasePaginationData([firstItem, secondItem], 1)).toStrictEqual({ hasMore: true, items: [firstItem] });
  });
});
