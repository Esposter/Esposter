import { toAbyssBenedictionChoices } from "#src/services/genshinAssets/spiralAbyss/toAbyssBenedictionChoices";
import { describe, expect, test } from "vitest";

describe(toAbyssBenedictionChoices, () => {
  const LEVEL_ID = 1;
  // Each Benediction's description text hash by its tower buff id, as the tower buff table gives them
  const DESCRIPTION_TEXT_HASHES = new Map([
    [4, 14],
    [23, 223],
    [25, 225],
  ]);

  test("each list reads as its weighted Benedictions with their description's text hash, in the order the table gives them", () => {
    expect.hasAssertions();

    expect(
      toAbyssBenedictionChoices(LEVEL_ID, ["4:100,23:100", "25:100", "4:50,23:100,25:100"], DESCRIPTION_TEXT_HASHES),
    ).toStrictEqual([
      [
        { descriptionTextHash: 14, towerBuffId: 4, weight: 100 },
        { descriptionTextHash: 223, towerBuffId: 23, weight: 100 },
      ],
      [{ descriptionTextHash: 225, towerBuffId: 25, weight: 100 }],
      [
        { descriptionTextHash: 14, towerBuffId: 4, weight: 50 },
        { descriptionTextHash: 223, towerBuffId: 23, weight: 100 },
        { descriptionTextHash: 225, towerBuffId: 25, weight: 100 },
      ],
    ]);
  });

  test("a chamber without three lists is refused rather than read short", () => {
    expect.hasAssertions();

    expect(() =>
      toAbyssBenedictionChoices(LEVEL_ID, ["4:100"], DESCRIPTION_TEXT_HASHES),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 1, has 1 Benediction lists, not three]`,
    );
  });

  test("a choice that is not an id and a weight is refused rather than dropped", () => {
    expect.hasAssertions();

    expect(() =>
      toAbyssBenedictionChoices(LEVEL_ID, ["4:100", "23", "25:100"], DESCRIPTION_TEXT_HASHES),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 1, has a Benediction choice 23 that is not an id and a weight]`,
    );
  });

  test("a Benediction the tower buff table does not hold is refused rather than read without its text", () => {
    expect.hasAssertions();

    expect(() =>
      toAbyssBenedictionChoices(LEVEL_ID, ["4:100", "99:100", "25:100"], DESCRIPTION_TEXT_HASHES),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 1, has a Benediction 99 the buff table does not hold]`,
    );
  });
});
