import { getFilterDisplayValue } from "#src/services/message/filter/getFilterDisplayValue";
import { getInvalidValueError } from "#src/services/message/filter/getInvalidValueError";
import { FilterType, FilterTypeAuthorTypes, FilterTypeHas } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(getFilterDisplayValue, () => {
  const value = "a";
  const invalidValueMessage = getInvalidValueError(getFilterDisplayValue.name, value).message;

  // The chip a picker is still filling in shows its keyword alone
  test("a filter still waiting for its value renders as its keyword", () => {
    expect.hasAssertions();

    expect(getFilterDisplayValue({ type: FilterType.Has, value: "" })).toBe("has:");
  });

  // False is a value the user picked, not an absent one — reading it as absent leaves `pinned: false` showing
  // As a keyword with nothing after it while its picker is still open
  test.each([true, false])(`${FilterType.Pinned}: renders %s`, (isPinned) => {
    expect.hasAssertions();

    expect(getFilterDisplayValue({ type: FilterType.Pinned, value: isPinned })).toBe(`pinned: ${isPinned}`);
  });

  test(`${FilterType.Has}: renders its media kind uncapitalized`, () => {
    expect.hasAssertions();

    expect(getFilterDisplayValue({ type: FilterType.Has, value: FilterTypeHas.Image })).toBe("has: image");
  });

  test.each(FilterTypeAuthorTypes)(`${FilterType.AuthorType}: renders %s uncapitalized`, (authorType) => {
    expect.hasAssertions();

    expect(getFilterDisplayValue({ type: FilterType.AuthorType, value: authorType })).toBe(
      `authorType: ${authorType.toLowerCase()}`,
    );
  });

  test.each([FilterType.Pinned, FilterType.AuthorType])("%s: rejects a value no picker could have chosen", (type) => {
    expect.hasAssertions();

    expect(() => getFilterDisplayValue({ type, value })).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${invalidValueMessage}]`,
    );
  });
});
