import type { CompositeKey } from "@esposter/db-schema";

import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getNextCursor } from "@@/server/services/pagination/cursor/getNextCursor";
import { describe, expect, test } from "vitest";

describe(getCursorPaginationData, () => {
  test("empty array", () => {
    expect.hasAssertions();

    expect(getCursorPaginationData([], 0, [])).toStrictEqual({
      hasMore: false,
      items: [],
      nextCursor: getNextCursor([], []),
    });
  });

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

    const item1: CompositeKey = { partitionKey: "", rowKey: "" };
    const item2: CompositeKey = { partitionKey: " ", rowKey: " " };
    const items: CompositeKey[] = [item1, item2];

    expect(getCursorPaginationData(items, 1, [])).toStrictEqual({
      hasMore: true,
      items: [item1],
      nextCursor: getNextCursor([item1], []),
    });
  });
});
