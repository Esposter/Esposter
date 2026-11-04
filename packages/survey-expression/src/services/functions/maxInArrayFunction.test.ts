import { SURVEY_ITEMS, TEST_CONTEXT } from "#src/services/functions/constants.test";
import { maxInArrayFunction } from "#src/services/functions/maxInArrayFunction";
import { describe, expect, test } from "vitest";

describe(maxInArrayFunction, () => {
  test.each([
    ["finds the largest field over the items", [SURVEY_ITEMS, "price"], 5],
    ["returns another field of the item with the largest value", [SURVEY_ITEMS, "price", "name"], "b"],
    [
      "returns the field of the first item among equal values",
      [
        [
          { p: 2, q: "x" },
          { p: 2, q: "y" },
        ],
        "p",
        "q",
      ],
      "x",
    ],
    ["compares the number texts and returns the field of the largest", [SURVEY_ITEMS, "q", "name"], "a"],
    ["is empty for an empty array", [[], "price"], undefined],
    ["is empty when the field name is missing", [SURVEY_ITEMS], undefined],
    ["is empty when the arguments hold a filter", [SURVEY_ITEMS, "price", "{name} = 'a'"], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(maxInArrayFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});
