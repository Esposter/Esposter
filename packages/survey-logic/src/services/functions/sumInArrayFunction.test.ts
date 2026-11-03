import { SURVEY_ITEMS, TEST_CONTEXT } from "#src/services/functions/constants.test";
import { sumInArrayFunction } from "#src/services/functions/sumInArrayFunction";
import { describe, expect, test } from "vitest";

describe(sumInArrayFunction, () => {
  test.each([
    ["sums a field over the items", [SURVEY_ITEMS, "price"], 6],
    ["sums the number texts and skips the texts that are not numbers", [SURVEY_ITEMS, "q"], 3],
    ["sums the fields of a record's items", [{ a: { p: 2 }, b: { p: 3 } }, "p"], 5],
    ["ignores a field returned by name", [SURVEY_ITEMS, "price", "name"], 6],
    ["sums nothing for a field no item holds", [SURVEY_ITEMS, "missing"], 0],
    ["sums nothing for an empty array", [[], "price"], 0],
    ["sums nothing when the field name is missing", [SURVEY_ITEMS], 0],
    ["is empty when the arguments hold a filter", [SURVEY_ITEMS, "price", "{name} = 'a'"], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(sumInArrayFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});
