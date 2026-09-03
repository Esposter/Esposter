import { AItemEntity } from "#shared/models/entity/AItemEntity";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { describe, expect, test } from "vitest";

describe(getOffsetPaginationData, () => {
  const firstItem = new AItemEntity();
  const secondItem = new AItemEntity();

  test("gets all", () => {
    expect.hasAssertions();

    const items: AItemEntity[] = [firstItem];

    expect(getOffsetPaginationData(items, 1)).toStrictEqual({
      hasMore: false,
      items,
    });
  });

  test("gets partial", () => {
    expect.hasAssertions();

    const items = [firstItem, secondItem];

    expect(getOffsetPaginationData(items, 1)).toStrictEqual({
      hasMore: true,
      items: [firstItem],
    });
  });
});
