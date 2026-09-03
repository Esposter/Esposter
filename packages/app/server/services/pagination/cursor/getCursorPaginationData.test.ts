import type { CompositeKey } from "@esposter/azure";

import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getNextCursor } from "@@/server/services/pagination/cursor/getNextCursor";
import { describe, expect, test } from "vitest";

describe(getCursorPaginationData, () => {
  test("gets all", () => {
    expect.hasAssertions();

    const items: CompositeKey[] = [{ partitionKey: "", rowKey: "" }];

    expect(getCursorPaginationData(items, 1, [])).toStrictEqual({
      hasMore: false,
      items,
      nextCursor: getNextCursor(items, []),
    });
  });

  test("gets partial", () => {
    expect.hasAssertions();

    const firstItem: CompositeKey = { partitionKey: "", rowKey: "" };
    const secondItem: CompositeKey = { partitionKey: " ", rowKey: " " };
    const items: CompositeKey[] = [firstItem, secondItem];

    expect(getCursorPaginationData(items, 1, [])).toStrictEqual({
      hasMore: true,
      items: [firstItem],
      nextCursor: getNextCursor([firstItem], []),
    });
  });
});
