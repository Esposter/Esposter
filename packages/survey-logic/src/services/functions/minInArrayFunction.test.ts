import { SURVEY_ITEMS, TEST_CONTEXT } from "#src/services/functions/constants.test";
import { minInArrayFunction } from "#src/services/functions/minInArrayFunction";
import { describe, expect, test } from "vitest";

describe(minInArrayFunction, () => {
  test.each([
    ["finds the smallest field over the items", [SURVEY_ITEMS, "price"], -1],
    ["returns another field of the item with the smallest value", [SURVEY_ITEMS, "price", "name"], "d"],
    ["is empty when no item holds a number in the field", [SURVEY_ITEMS, "name"], undefined],
    ["is empty for an empty array", [[], "price"], undefined],
    ["is empty when the field name is missing", [SURVEY_ITEMS], undefined],
    ["is empty when the arguments hold a filter", [SURVEY_ITEMS, "price", "{name} = 'a'"], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(minInArrayFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});
