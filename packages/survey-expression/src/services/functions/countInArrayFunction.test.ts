import { SURVEY_ITEMS, TEST_CONTEXT } from "#src/services/functions/constants.test";
import { countInArrayFunction } from "#src/services/functions/countInArrayFunction";
import { describe, expect, test } from "vitest";

describe(countInArrayFunction, () => {
  test.each([
    ["counts the items whose field holds a value", [SURVEY_ITEMS, "price"], 3],
    ["counts only the items whose field reads as a number", [SURVEY_ITEMS, "q"], 1],
    ["counts nothing for an empty array", [[], "price"], 0],
    ["counts nothing for an unanswered array", [undefined, "price"], 0],
    ["has no count when the field name is missing", [SURVEY_ITEMS], undefined],
    ["has no count when the field name is not text", [SURVEY_ITEMS, 5], undefined],
    ["is empty when the arguments hold a filter", [SURVEY_ITEMS, "price", "{name} = 'a'"], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(countInArrayFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});
