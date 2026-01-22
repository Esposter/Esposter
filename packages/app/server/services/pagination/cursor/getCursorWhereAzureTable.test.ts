import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { serialize } from "#shared/services/pagination/cursor/serialize";
import { getCursorWhereAzureTable } from "@@/server/services/pagination/cursor/getCursorWhereAzureTable";
import { BinaryOperator, CompositeKey, CompositeKeyPropertyNames } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(getCursorWhereAzureTable, () => {
  const cursor = { partitionKey: "", rowKey: "" };
  const binaryOperatorSortItemMap = {
    [BinaryOperator.ge]: { isIncludeValue: true, key: CompositeKeyPropertyNames.partitionKey, order: SortOrder.Asc },
    [BinaryOperator.gt]: { key: CompositeKeyPropertyNames.partitionKey, order: SortOrder.Asc },
    [BinaryOperator.le]: { isIncludeValue: true, key: CompositeKeyPropertyNames.partitionKey, order: SortOrder.Desc },
    [BinaryOperator.lt]: { key: CompositeKeyPropertyNames.partitionKey, order: SortOrder.Desc },
  } as const satisfies Partial<Record<BinaryOperator, SortItem<keyof CompositeKey>>>;

  test("gets", () => {
    expect.hasAssertions();

    for (const [operator, sortItem] of Object.entries(binaryOperatorSortItemMap)) {
      const serializedCursors = serialize(cursor, [sortItem]);

      expect(getCursorWhereAzureTable(serializedCursors, [sortItem as SortItem<keyof CompositeKey>])).toStrictEqual([
        { key: CompositeKeyPropertyNames.partitionKey, operator, value: cursor.partitionKey },
      ]);
    }
  });
});
