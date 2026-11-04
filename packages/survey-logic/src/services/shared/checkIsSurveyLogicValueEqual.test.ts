import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicValueEqual } from "#src/services/shared/checkIsSurveyLogicValueEqual";
import { describe, expect, test } from "vitest";

describe(checkIsSurveyLogicValueEqual, () => {
  test.each<[string, SurveyLogicValue, SurveyLogicValue, boolean]>([
    ["pairs each list item with an equal item of the other list, not by sorted text", [1, 10], ["010", "1"], true],
    ["pairs a list's numbers with its texts by equality, not by their order as text", [10, "9"], ["09", 10], true],
    ["holds two lists of the same items in another order equal", ["a", "b"], ["b", "a"], true],
    ["pairs each item with only one item of the other list", [1, 1], [1, 2], false],
    ["holds lists of different lengths unequal", [1], [1, 1], false],
    ["holds a record's empty field equal to a field the other record lacks", { a: 1, b: "" }, { a: 1 }, true],
    [
      "holds a record's field equal to a field of the other record that is empty",
      { a: 1, b: "" },
      { a: 1, c: "" },
      true,
    ],
    ["holds a record's value unequal to a field the other record lacks", { a: 1, b: 2 }, { a: 1 }, false],
    ["holds records with the same fields and values equal in either order", { a: 1, b: "x" }, { a: 1, b: "x" }, true],
    ["holds records unequal when one value differs", { a: 1 }, { a: 2 }, false],
    ["holds two records with only empty fields equal", { a: "" }, { b: undefined }, true],
  ])("%s", (_title, left, right, expected) => {
    expect.hasAssertions();

    expect(checkIsSurveyLogicValueEqual(left, right)).toBe(expected);
    expect(checkIsSurveyLogicValueEqual(right, left)).toBe(expected);
  });
});
