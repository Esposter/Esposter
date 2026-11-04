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
  ])("%s", (_title, left, right, expected) => {
    expect.hasAssertions();

    expect(checkIsSurveyLogicContaining(left, right)).toBe(expected);
  });
});
