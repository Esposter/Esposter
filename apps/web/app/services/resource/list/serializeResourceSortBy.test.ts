import { serializeResourceSortBy } from "@/services/resource/list/serializeResourceSortBy";
import { SortOrder } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(serializeResourceSortBy, () => {
  test("serializes sort items to a query-safe string", () => {
    expect.hasAssertions();

    expect(serializeResourceSortBy([])).toBe("");
    expect(
      serializeResourceSortBy([
        { key: "updatedAt", order: SortOrder.Desc },
        { key: "name", order: SortOrder.Asc },
      ]),
    ).toBe("updatedAt:desc,name:asc");
  });
});
