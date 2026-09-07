import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { deserializeResourceSortBy } from "@/services/resource/list/deserializeResourceSortBy";
import { describe, expect, test } from "vitest";

describe(deserializeResourceSortBy, () => {
  test("deserializes a serialized sort string", () => {
    expect.hasAssertions();

    expect(deserializeResourceSortBy("updatedAt:desc,name:asc")).toStrictEqual([
      { key: "updatedAt", order: SortOrder.Desc },
      { key: "name", order: SortOrder.Asc },
    ]);
  });

  test("drops invalid keys, orders, and malformed entries", () => {
    expect.hasAssertions();

    expect(deserializeResourceSortBy("")).toStrictEqual([]);
    expect(deserializeResourceSortBy(" :desc")).toStrictEqual([]);
    expect(deserializeResourceSortBy("name: ")).toStrictEqual([]);
    expect(deserializeResourceSortBy("name")).toStrictEqual([]);
    expect(deserializeResourceSortBy(" :asc,name:asc")).toStrictEqual([{ key: "name", order: SortOrder.Asc }]);
  });
});
