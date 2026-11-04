import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicContaining } from "#src/services/shared/checkIsSurveyLogicContaining";
import { describe, expect, test } from "vitest";

describe(checkIsSurveyLogicContaining, () => {
  test.each<[string, SurveyLogicValue, SurveyLogicValue, boolean]>([
    ["finds a text inside a text", "abc", "b", true],
    ["finds nothing in a text for a needle in another case", "abc", "B", false],
    ["finds a zero needle inside a text", "a0b", 0, true],
    ["finds nothing in a text for a record needle", "abc", { a: "b" }, false],
    ["finds nothing in a text for an unanswered record needle", "abc", { a: undefined }, false],
    ["finds nothing in a text for an empty needle", "abc", "", false],
    ["finds nothing in an unanswered haystack", undefined, "x", false],
    ["finds nothing in a list for an empty list needle", [1, 2], [], false],
    ["finds nothing in a list for an empty text needle, even one of its items", [1, ""], "", false],
    ["finds nothing in a list holding an unanswered item for an unanswered needle", [undefined], undefined, false],
    ["finds every item of a list needle in a text", "ab", ["a", "b"], true],
    ["finds nothing in a text for a list needle with a missing item", "ab", ["a", "z"], false],
    ["finds the items of a list needle one by one, never joined into one text", "a b", ["a", "b"], true],
    ["finds a number inside a text as text", "a10", 10, true],
  ])("%s", (_title, left, right, expected) => {
    expect.hasAssertions();

    expect(checkIsSurveyLogicContaining(left, right)).toBe(expected);
  });
});
