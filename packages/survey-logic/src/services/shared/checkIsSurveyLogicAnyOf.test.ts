import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicAnyOf } from "#src/services/shared/checkIsSurveyLogicAnyOf";
import { describe, expect, test } from "vitest";

describe(checkIsSurveyLogicAnyOf, () => {
  test.each<[string, SurveyLogicValue, SurveyLogicValue, boolean]>([
    ["is any of a list when the list holds one of its items", ["red", "blue"], ["green", "red"], true],
    ["is not any of a list that holds none of its items", ["red", "blue"], ["green"], false],
    ["is any of a list needle when the text holds one of its items", "ab", ["z", "a"], true],
    ["is not any of a list needle when the text holds none of its items", "ab", ["z"], false],
    ["is any of a text needle the text holds as a substring", "red", "re", true],
    ["is not any of a text needle the text does not hold", "re", "red", false],
    ["is not any of an empty needle", "abc", "", false],
    ["is not any of an empty list needle", "abc", [], false],
    ["is not any of nothing when both sides are empty", "", "", false],
    ["is not any of a needle for an unanswered haystack", undefined, ["red"], false],
  ])("%s", (_title, left, right, expected) => {
    expect.hasAssertions();

    expect(checkIsSurveyLogicAnyOf(left, right)).toBe(expected);
  });
});
