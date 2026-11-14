import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { CompositeKey } from "@esposter/db-schema";

import { getCursorWhereStreamTable } from "#server/services/pagination/cursor/getCursorWhereStreamTable";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { serialize } from "#shared/services/pagination/cursor/serialize";
import { BinaryOperator, CompositeKeyPropertyNames } from "@esposter/db-schema";

import { describe, expect, test } from "vitest";

describe(getCursorWhereStreamTable, () => {
  const cursor = { partitionKey: "partitionKey", rowKey: "" };
  const sortItems: [BinaryOperator, SortItem<keyof CompositeKey>][] = [
    [BinaryOperator.Gt, { key: CompositeKeyPropertyNames.partitionKey, order: SortOrder.Asc }],
    [BinaryOperator.Ge, { isIncludeValue: true, key: CompositeKeyPropertyNames.partitionKey, order: SortOrder.Asc }],
    [BinaryOperator.Lt, { key: CompositeKeyPropertyNames.partitionKey, order: SortOrder.Desc }],
    [BinaryOperator.Le, { isIncludeValue: true, key: CompositeKeyPropertyNames.partitionKey, order: SortOrder.Desc }],
  ];

  test.each(sortItems)("compares with %s", (operator, sortItem) => {
    expect.hasAssertions();

    const serializedCursors = serialize(cursor, [sortItem]);

    expect(getCursorWhereStreamTable(serializedCursors, [sortItem])).toStrictEqual([
      { key: CompositeKeyPropertyNames.partitionKey, operator, value: cursor.partitionKey },
    ]);
  });
});
