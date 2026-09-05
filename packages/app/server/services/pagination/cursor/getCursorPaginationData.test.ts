import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { CompositeKey } from "@esposter/azure";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { CompositeKeyPropertyNames } from "@esposter/azure";
import { describe, expect, test } from "vitest";

describe(getCursorPaginationData, () => {
  const firstItem: CompositeKey = { partitionKey: "partitionKey", rowKey: "0" };
  const secondItem: CompositeKey = { partitionKey: "partitionKey", rowKey: "1" };
  const sortBy: SortItem<keyof CompositeKey>[] = [{ key: CompositeKeyPropertyNames.rowKey, order: SortOrder.Asc }];

  test("hands back every item when the limit covers them", () => {
    expect.hasAssertions();

    const items = [firstItem];

    expect(getCursorPaginationData(items, 1, sortBy)).toStrictEqual({
      hasMore: false,
      items,
      nextCursor: "eyJyb3dLZXkiOiIwIn0=",
    });
  });

  // The extra item is what answers `hasMore`, so it is dropped from the page and never cursored past — a
  // Cursor naming it would skip it on the next read
  test("drops the item past the limit and cursors on the last one it kept", () => {
    expect.hasAssertions();

    expect(getCursorPaginationData([firstItem, secondItem], 1, sortBy)).toStrictEqual({
      hasMore: true,
      items: [firstItem],
      nextCursor: "eyJyb3dLZXkiOiIwIn0=",
    });
  });
});
