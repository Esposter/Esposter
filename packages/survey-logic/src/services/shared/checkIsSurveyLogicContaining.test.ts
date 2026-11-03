import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicContaining } from "#src/services/shared/checkIsSurveyLogicContaining";
import { describe, expect, test } from "vitest";

describe(checkIsSurveyLogicContaining, () => {
  test.each<[string, SurveyLogicValue, SurveyLogicValue, boolean, boolean]>([
    ["finds a text inside a text", "abc", "b", true, true],
    ["finds nothing in a text for a record needle", "abc", { a: "b" }, true, false],
    ["finds nothing in a text for an unanswered record needle", "abc", { a: undefined }, true, false],
    ["finds nothing in a text for an empty needle", "abc", "", true, false],
    ["finds nothing in a text for an empty needle, not contains either", "abc", "", false, false],
  ])("%s", (_title, left, right, isContains, expected) => {
    expect.hasAssertions();

    expect(checkIsSurveyLogicContaining(left, right, isContains)).toBe(expected);
  });
});
