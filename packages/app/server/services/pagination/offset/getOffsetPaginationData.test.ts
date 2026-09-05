import { AItemEntity } from "#shared/models/entity/AItemEntity";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { describe, expect, test } from "vitest";

describe(getOffsetPaginationData, () => {
  const firstItem = new AItemEntity();
  const secondItem = new AItemEntity();

  test("hands back every item when the limit covers them", () => {
    expect.hasAssertions();

    const items: AItemEntity[] = [firstItem];

    expect(getOffsetPaginationData(items, 1)).toStrictEqual({
      hasMore: false,
      items,
    });
  });

  test("drops the item past the limit and reports there is more", () => {
    expect.hasAssertions();

    const items = [firstItem, secondItem];

    expect(getOffsetPaginationData(items, 1)).toStrictEqual({
      hasMore: true,
      items: [firstItem],
    });
  });
});
