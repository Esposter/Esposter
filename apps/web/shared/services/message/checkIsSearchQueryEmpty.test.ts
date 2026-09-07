import { checkIsSearchQueryEmpty } from "#shared/services/message/checkIsSearchQueryEmpty";
import { FilterType } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(checkIsSearchQueryEmpty, () => {
  test("empty", () => {
    expect.hasAssertions();

    expect(checkIsSearchQueryEmpty("", [])).toBe(true);
    expect(checkIsSearchQueryEmpty(" ", [])).toBe(true);
    // A chip still waiting for its value narrows nothing, so it is no more a search than no chip at all —
    // Searching on one is what sent its "" to a service that rejects it
    expect(checkIsSearchQueryEmpty("", [{ type: FilterType.Has, value: "" }])).toBe(true);
  });

  test("non-empty", () => {
    expect.hasAssertions();

    expect(checkIsSearchQueryEmpty("a", [])).toBe(false);
    expect(checkIsSearchQueryEmpty("", [{ type: FilterType.Has, value: " " }])).toBe(false);
    expect(checkIsSearchQueryEmpty("", [{ type: FilterType.Pinned, value: false }])).toBe(false);
  });
});
