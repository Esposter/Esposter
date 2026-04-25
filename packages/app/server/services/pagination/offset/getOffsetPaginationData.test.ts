import { AItemEntity } from "#shared/models/entity/AItemEntity";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { describe, expect, test } from "vitest";

describe(getOffsetPaginationData, () => {
  const item1 = new AItemEntity();
  const item2 = new AItemEntity();

  test("empty array", () => {
    expect.hasAssertions();

    expect(getOffsetPaginationData([], 0)).toStrictEqual({
      hasMore: false,
      items: [],
    });
  });

  test("gets all", () => {
    expect.hasAssertions();

    const items: AItemEntity[] = [item1];

    expect(getOffsetPaginationData(items, 1)).toStrictEqual({
      hasMore: false,
      items,
    });
  });

  test("gets partial", () => {
    expect.hasAssertions();

    const items = [item1, item2];

    expect(getOffsetPaginationData(items, 1)).toStrictEqual({
      hasMore: true,
      items: [item1],
    });
  });
});
