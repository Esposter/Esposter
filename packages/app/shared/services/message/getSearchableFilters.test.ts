import { getSearchableFilters } from "#shared/services/message/getSearchableFilters";
import { FilterType } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(getSearchableFilters, () => {
  const pendingFilter = { type: FilterType.Has, value: "" };
  const filter = { type: FilterType.Has, value: " " };

  // A chip added by typing its keyword has no value until a picker gives it one, and "" is not a value the
  // Search input schema accepts — the search it would be sent with is the one the schema rejects
  test("drops a filter still waiting for its value", () => {
    expect.hasAssertions();

    expect(getSearchableFilters([pendingFilter])).toStrictEqual([]);
    expect(getSearchableFilters([pendingFilter, filter])).toStrictEqual([filter]);
  });

  // `pinned: false` is a value the user picked, so only the "" sentinel counts as pending
  test(`${FilterType.Pinned}: keeps a filter whose value is false`, () => {
    expect.hasAssertions();

    expect(getSearchableFilters([{ type: FilterType.Pinned, value: false }])).toStrictEqual([
      { type: FilterType.Pinned, value: false },
    ]);
  });

  // The comparison is exact, so two filters of one type whose values differ only by whitespace are two filters
  test("drops a repeated filter and keeps one differing only by whitespace", () => {
    expect.hasAssertions();

    expect(getSearchableFilters([filter, { ...filter }])).toStrictEqual([filter]);
    expect(getSearchableFilters([filter, { type: FilterType.Has, value: "a" }])).toStrictEqual([
      filter,
      { type: FilterType.Has, value: "a" },
    ]);
  });
});
