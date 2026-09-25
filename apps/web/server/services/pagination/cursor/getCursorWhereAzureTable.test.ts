import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { CompositeKey } from "@esposter/azure";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { serialize } from "#shared/services/pagination/cursor/serialize";
import { getCursorWhereAzureTable } from "@@/server/services/pagination/cursor/getCursorWhereAzureTable";
import { BinaryOperator, CompositeKeyPropertyNames } from "@esposter/azure";
import { describe, expect, test } from "vitest";

describe(getCursorWhereAzureTable, () => {
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

    expect(getCursorWhereAzureTable(serializedCursors, [sortItem])).toStrictEqual([
      { key: CompositeKeyPropertyNames.partitionKey, operator, value: cursor.partitionKey },
    ]);
  });
});
