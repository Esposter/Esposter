import { getFilterDisplayValue } from "@/services/message/filter/getFilterDisplayValue";
import { FilterType, FilterTypeHas, serializeValue } from "@esposter/db-schema";
import { InvalidOperationError, Operation, uncapitalize } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getFilterDisplayValue, () => {
  const value = "a";

  // The chip a picker is still filling in shows its keyword alone
  test("a filter still waiting for its value renders as its keyword", () => {
    expect.hasAssertions();

    expect(getFilterDisplayValue({ type: FilterType.Has, value: "" })).toBe(`${uncapitalize(FilterType.Has)}:`);
  });

  // False is a value the user picked, not an absent one — reading it as absent is what left `pinned: false`
  // Showing as a keyword with nothing after it while its picker stayed open
  test.each([true, false])(`${FilterType.Pinned}: renders %s`, (isPinned) => {
    expect.hasAssertions();

    expect(getFilterDisplayValue({ type: FilterType.Pinned, value: isPinned })).toBe(
      `${uncapitalize(FilterType.Pinned)}: ${isPinned}`,
    );
  });

  test(`${FilterType.Has}: renders its media kind uncapitalized`, () => {
    expect.hasAssertions();

    expect(getFilterDisplayValue({ type: FilterType.Has, value: FilterTypeHas.Image })).toBe(
      `${uncapitalize(FilterType.Has)}: ${uncapitalize(FilterTypeHas.Image)}`,
    );
  });

  test(`${FilterType.Pinned}: rejects a value no picker could have chosen`, () => {
    expect.hasAssertions();

    expect(() => getFilterDisplayValue({ type: FilterType.Pinned, value })).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, getFilterDisplayValue.name, serializeValue(value)).message}]`,
    );
  });
});
