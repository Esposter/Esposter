import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { deserializeResourceSortBy } from "@/services/resource/list/deserializeResourceSortBy";
import { serializeResourceSortBy } from "@/services/resource/list/serializeResourceSortBy";
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

  test("round-trips through deserializeResourceSortBy", () => {
    expect.hasAssertions();

    const sortBy = [
      { key: "updatedAt", order: SortOrder.Desc },
      { key: "name", order: SortOrder.Asc },
    ] as const;

    expect(deserializeResourceSortBy(serializeResourceSortBy([...sortBy]))).toStrictEqual([...sortBy]);
  });
});
