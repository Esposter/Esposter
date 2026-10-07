import { foldPlanRepeats } from "#src/services/genshinAssets/fit/foldPlanRepeats";
import { describe, expect, test } from "vitest";

describe(foldPlanRepeats, () => {
  test("averages each block over every repeat of the rows, drawn cells of the commonest tag alone", () => {
    expect.hasAssertions();

    expect(
      foldPlanRepeats(
        [
          [0, 0, 0],
          [1, 1, 1],
          [2, 2, 2],
          [3, 3, 3],
          [4, 4, 4],
          [5, 5, 5],
          [6, 6, 6],
          [7, 7, 7],
        ],
        Int16Array.from([0, 0, 0, -1, 0, 0, 1, -1]),
        { block: 2, height: 4, repeats: 2, width: 2 },
      ),
    ).toStrictEqual({ colors: [[2.4, 2.4, 2.4]], height: 1, tags: Int16Array.from([0]), width: 1 });
  });
});
