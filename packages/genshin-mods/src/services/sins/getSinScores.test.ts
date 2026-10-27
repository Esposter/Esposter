import { describe, expect, test } from "vitest";

import { getSinScores } from "./getSinScores";

describe(getSinScores, () => {
  test("leaves out a sin with no evidence", () => {
    expect.hasAssertions();

    const scores = getSinScores({ pride: [1] });
    expect(scores.map(({ name }) => name)).toStrictEqual(["pride"]);
  });

  test("returns nothing before any prompt is scored", () => {
    expect.hasAssertions();

    expect(getSinScores({})).toStrictEqual([]);
  });
});
