import { dedupeFilters } from "#shared/services/message/dedupeFilters";
import { FilterType } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(dedupeFilters, () => {
  test("dedupes", () => {
    expect.hasAssertions();

    const filter1 = { type: FilterType.Has, value: "" };
    const filter2 = { type: FilterType.Has, value: " " };

    expect(dedupeFilters([filter1, filter1])).toStrictEqual([filter1]);
    expect(dedupeFilters([filter1, filter2])).toStrictEqual([filter1, filter2]);
  });
});
