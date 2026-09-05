import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { CompositeKey } from "@esposter/azure";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { getNextCursor } from "@@/server/services/pagination/cursor/getNextCursor";
import { CompositeKeyPropertyNames } from "@esposter/azure";
import { describe, expect, test } from "vitest";

describe(getNextCursor, () => {
  const sortBy: SortItem<keyof CompositeKey>[] = [{ key: CompositeKeyPropertyNames.rowKey, order: SortOrder.Asc }];

  test("answers with the empty cursor when there is no last item to resume from", () => {
    expect.hasAssertions();

    expect(getNextCursor([], sortBy)).toBe("");
  });

  // The cursor carries only the sorted keys, so the next page resumes on the same values it was ordered by
  test("encodes the last item's sorted keys", () => {
    expect.hasAssertions();

    const items: CompositeKey[] = [
      { partitionKey: "partitionKey", rowKey: "0" },
      { partitionKey: "partitionKey", rowKey: "1" },
    ];

    expect(getNextCursor(items, sortBy)).toBe("eyJyb3dLZXkiOiIxIn0=");
  });
});
