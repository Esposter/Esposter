import { toAbyssBenedictionChoices } from "#src/services/genshinAssets/spiralAbyss/toAbyssBenedictionChoices";
import { describe, expect, test } from "vitest";

describe(toAbyssBenedictionChoices, () => {
  const LEVEL_ID = 1;

  test("each list reads as its weighted Benedictions, in the order the table gives them", () => {
    expect.hasAssertions();

    expect(toAbyssBenedictionChoices(LEVEL_ID, ["4:100,23:100", "25:100", "6:50,7:100,18:100"])).toStrictEqual([
      [
        { towerBuffId: 4, weight: 100 },
        { towerBuffId: 23, weight: 100 },
      ],
      [{ towerBuffId: 25, weight: 100 }],
      [
        { towerBuffId: 6, weight: 50 },
        { towerBuffId: 7, weight: 100 },
        { towerBuffId: 18, weight: 100 },
      ],
    ]);
  });

  test("a chamber without three lists is refused rather than read short", () => {
    expect.hasAssertions();

    expect(() => toAbyssBenedictionChoices(LEVEL_ID, ["4:100"])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 1, has 1 Benediction lists, not three]`,
    );
  });

  test("a choice that is not an id and a weight is refused rather than dropped", () => {
    expect.hasAssertions();

    expect(() => toAbyssBenedictionChoices(LEVEL_ID, ["4:100", "23", "24:100"])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 1, has a Benediction choice 23 that is not an id and a weight]`,
    );
  });
});
