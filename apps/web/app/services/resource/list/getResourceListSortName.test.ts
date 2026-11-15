import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { getResourceListSortName } from "#src/services/resource/list/getResourceListSortName";
import { SortOrder } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(getResourceListSortName, () => {
  const lastAccessedDesc: SortItem<keyof ResourceListItem>[] = [{ key: "lastAccessedAt", order: SortOrder.Desc }];

  // The server refuses a last-accessed order without the accessed filter, so a list that is not accessed-only falls back
  // To its default instead of sending a name the read would reject
  test.each([
    ["a list of every resource", {}, "updatedAt-desc"],
    ["the accessed filter", { isAccessed: true }, "lastAccessedAt-desc"],
  ] as const)("names the last-accessed order only for %s", (_title, filter, expected) => {
    expect.hasAssertions();

    expect(getResourceListSortName(lastAccessedDesc, filter)).toBe(expected);
  });

  // A search is ordered by relevance, which the server takes from the search alone
  test("names no order for a search", () => {
    expect.hasAssertions();

    expect(getResourceListSortName(lastAccessedDesc, { isAccessed: true, searchQuery: " " })).toBeUndefined();
  });
});
