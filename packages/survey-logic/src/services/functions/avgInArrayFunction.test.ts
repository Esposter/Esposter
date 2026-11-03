import { avgInArrayFunction } from "#src/services/functions/avgInArrayFunction";
import { SURVEY_ITEMS, TEST_CONTEXT } from "#src/services/functions/constants.test";
import { describe, expect, test } from "vitest";

describe(avgInArrayFunction, () => {
  test.each([
    ["averages a field over the items whose field holds a value", [SURVEY_ITEMS, "price"], 2],
    ["averages the number texts over the items that hold a value", [SURVEY_ITEMS, "q"], 1.5],
    ["averages nothing to zero for an empty array", [[], "price"], 0],
    ["averages nothing to zero when the field name is missing", [SURVEY_ITEMS], 0],
    ["is empty when the arguments hold a filter", [SURVEY_ITEMS, "price", "{name} = 'a'"], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(avgInArrayFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});
