import { getIsSearchQueryEmpty } from "#shared/services/message/getIsSearchQueryEmpty";
import { FilterType } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(getIsSearchQueryEmpty, () => {
  test("empty", () => {
    expect.hasAssertions();

    expect(getIsSearchQueryEmpty("", [])).toBe(true);
    expect(getIsSearchQueryEmpty(" ", [])).toBe(true);
  });

  test("non-empty", () => {
    expect.hasAssertions();

    expect(getIsSearchQueryEmpty("a", [])).toBe(false);
    expect(getIsSearchQueryEmpty("", [{ type: FilterType.Has, value: "" }])).toBe(false);
  });
});
