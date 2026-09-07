import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { serialize } from "#shared/services/pagination/cursor/serialize";
import { getCursorWhereAzureTable } from "@@/server/services/pagination/cursor/getCursorWhereAzureTable";
import { BinaryOperator, CompositeKey, CompositeKeyPropertyNames } from "@esposter/azure";
import { describe, expect, test } from "vitest";

describe(getCursorWhereAzureTable, () => {
  const cursor = { partitionKey: "partitionKey", rowKey: "" };
  const sortItems: [BinaryOperator, SortItem<keyof CompositeKey>][] = [
    [BinaryOperator.gt, { key: CompositeKeyPropertyNames.partitionKey, order: SortOrder.Asc }],
    [BinaryOperator.ge, { isIncludeValue: true, key: CompositeKeyPropertyNames.partitionKey, order: SortOrder.Asc }],
    [BinaryOperator.lt, { key: CompositeKeyPropertyNames.partitionKey, order: SortOrder.Desc }],
    [BinaryOperator.le, { isIncludeValue: true, key: CompositeKeyPropertyNames.partitionKey, order: SortOrder.Desc }],
  ];

  test.each(sortItems)("compares with %s", (operator, sortItem) => {
    expect.hasAssertions();

    const serializedCursors = serialize(cursor, [sortItem]);

    expect(getCursorWhereAzureTable(serializedCursors, [sortItem])).toStrictEqual([
      { key: CompositeKeyPropertyNames.partitionKey, operator, value: cursor.partitionKey },
    ]);
  });
});
