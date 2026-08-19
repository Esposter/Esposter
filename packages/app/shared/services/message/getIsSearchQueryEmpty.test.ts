import { getIsSearchQueryEmpty } from "#shared/services/message/getIsSearchQueryEmpty";
import { FilterType } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(getIsSearchQueryEmpty, () => {
  test("empty", () => {
    expect.hasAssertions();

    expect(getIsSearchQueryEmpty("", [])).toBe(true);
    expect(getIsSearchQueryEmpty(" ", [])).toBe(true);
    // A chip still waiting for its value narrows nothing, so it is no more a search than no chip at all —
    // Searching on one is what sent its "" to a service that rejects it
    expect(getIsSearchQueryEmpty("", [{ type: FilterType.Has, value: "" }])).toBe(true);
  });

  test("non-empty", () => {
    expect.hasAssertions();

    expect(getIsSearchQueryEmpty("a", [])).toBe(false);
    expect(getIsSearchQueryEmpty("", [{ type: FilterType.Has, value: " " }])).toBe(false);
    expect(getIsSearchQueryEmpty("", [{ type: FilterType.Pinned, value: false }])).toBe(false);
  });
});
