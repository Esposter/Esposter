import { SURVEY_ITEMS, TEST_CONTEXT } from "#src/services/functions/constants.test";
import { countInArrayFunction } from "#src/services/functions/countInArrayFunction";
import { describe, expect, test } from "vitest";

describe(countInArrayFunction, () => {
  test.each([
    ["counts the items whose field holds a value", [SURVEY_ITEMS, "price"], 3],
    ["counts the items whose field holds a text, number or not", [SURVEY_ITEMS, "q"], 2],
    ["counts nothing for an empty array", [[], "price"], 0],
    ["counts nothing when the field name is missing", [SURVEY_ITEMS], 0],
    ["is empty when the arguments hold a filter", [SURVEY_ITEMS, "price", "{name} = 'a'"], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(countInArrayFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});
