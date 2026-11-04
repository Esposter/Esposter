import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicAllOf } from "#src/services/shared/checkIsSurveyLogicAllOf";
import { describe, expect, test } from "vitest";

describe(checkIsSurveyLogicAllOf, () => {
  test.each<[string, SurveyLogicValue, SurveyLogicValue, boolean]>([
    ["is all of a list needle the list holds every item of", ["red", "blue", "green"], ["red", "blue"], true],
    ["is not all of a list needle the list lacks an item of", ["red", "blue"], ["red", "pink"], false],
    ["is all of a list needle the text holds every item of", "ab", ["a", "b"], true],
    ["is not all of a list needle the text lacks an item of", "ab", ["a", "z"], false],
    ["is all of an empty needle", "abc", "", true],
    ["is all of an empty list needle", "abc", [], true],
    ["is all of an empty needle for an unanswered haystack", undefined, undefined, true],
    ["is not all of a needle for an empty haystack", "", "a", false],
  ])("%s", (_title, left, right, expected) => {
    expect.hasAssertions();

    expect(checkIsSurveyLogicAllOf(left, right)).toBe(expected);
  });
});
