import type { SurveyChoice } from "#src/models/SurveyChoice";

import { SurveyChoicesOrder } from "#src/models/SurveyChoicesOrder";
import { getSurveyOrderedChoices } from "#src/services/getSurveyOrderedChoices";
import { describe, expect, test } from "vitest";

describe(getSurveyOrderedChoices, () => {
  const choices: SurveyChoice[] = [
    { text: "Pear", value: 1 },
    { text: "", value: "apple" },
    { text: "Mango", value: 3 },
    { text: "Fig", value: 4 },
    { text: "Kiwi", value: 5 },
  ];

  test("none keeps the list's own order", () => {
    expect.hasAssertions();

    expect(getSurveyOrderedChoices(choices, SurveyChoicesOrder.None, "seed")).toStrictEqual(choices);
  });

  test("ascending and descending sort by the text a respondent reads", () => {
    expect.hasAssertions();

    const ascending = getSurveyOrderedChoices(choices, SurveyChoicesOrder.Ascending, "seed").map(({ value }) => value);

    expect(ascending).toStrictEqual(["apple", 4, 5, 3, 1]);
    expect(
      getSurveyOrderedChoices(choices, SurveyChoicesOrder.Descending, "seed").map(({ value }) => value),
    ).toStrictEqual(ascending.toReversed());
  });

  test("random is the same order for the same seed, a permutation, and moves with the seed", () => {
    expect.hasAssertions();

    const first = getSurveyOrderedChoices(choices, SurveyChoicesOrder.Random, "response-1");

    expect(getSurveyOrderedChoices(choices, SurveyChoicesOrder.Random, "response-1")).toStrictEqual(first);
    expect(first.toSorted((a, b) => Number(a.value) - Number(b.value))).toHaveLength(choices.length);
    expect(new Set(first.map(({ value }) => value))).toStrictEqual(new Set(choices.map(({ value }) => value)));
    expect(
      ["response-2", "response-3", "response-4", "response-5"].some(
        (seed) =>
          getSurveyOrderedChoices(choices, SurveyChoicesOrder.Random, seed)
            .map(({ value }) => value)
            .join(",") !== first.map(({ value }) => value).join(","),
      ),
    ).toBe(true);
  });
});
