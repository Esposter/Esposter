import { getFilterKeyword } from "@/services/message/filter/getFilterKeyword";
import { getFilterTypeFromSearchQuery } from "@/services/message/filter/getFilterTypeFromSearchQuery";
import { FilterType, FilterTypes } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(getFilterTypeFromSearchQuery, () => {
  test.each(FilterTypes)("%s: a keyword followed by a colon becomes that filter", (filterType) => {
    expect.hasAssertions();

    expect(getFilterTypeFromSearchQuery(getFilterKeyword(filterType))).toBe(filterType);
    expect(getFilterTypeFromSearchQuery(` ${filterType.toUpperCase()}: `)).toBe(filterType);
  });

  // Anything that is not one of the keywords is search text and searches for itself, colon and all. Converting
  // It into a filter leaves a chip with a value no picker chose and no service accepts
  test("a word that is not a keyword stays search text", () => {
    expect.hasAssertions();

    expect(getFilterTypeFromSearchQuery("a")).toBeUndefined();
    expect(getFilterTypeFromSearchQuery("a:")).toBeUndefined();
    expect(getFilterTypeFromSearchQuery(":")).toBeUndefined();
    expect(getFilterTypeFromSearchQuery("")).toBeUndefined();
    // The colon is what commits the keyword, so the bare word is still being typed
    expect(getFilterTypeFromSearchQuery(getFilterKeyword(FilterType.From).slice(0, -1))).toBeUndefined();
  });
});
