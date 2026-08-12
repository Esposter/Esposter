import { dedupeFilters } from "#shared/services/message/dedupeFilters";
import { FilterType } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(dedupeFilters, () => {
  // The comparison is exact, so two filters of one type whose values differ only by whitespace are two filters
  test("drops a repeated filter and keeps one differing only by whitespace", () => {
    expect.hasAssertions();

    const filter = { type: FilterType.Has, value: "" };
    const duplicateFilter = { type: FilterType.Has, value: "" };
    const whitespaceFilter = { type: FilterType.Has, value: " " };

    expect(dedupeFilters([filter, duplicateFilter])).toStrictEqual([filter]);
    expect(dedupeFilters([filter, whitespaceFilter])).toStrictEqual([filter, whitespaceFilter]);
  });
});
