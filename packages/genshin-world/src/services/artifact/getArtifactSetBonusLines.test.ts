import type { ActiveArtifactSetBonus } from "#src/models/artifact/ActiveArtifactSetBonus";
import type { GameText } from "genshin-text";

import { Attribute } from "#src/models/character/Attribute";
import { getArtifactSetBonusLines } from "#src/services/artifact/getArtifactSetBonusLines";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(getArtifactSetBonusLines, () => {
  const SET_ID = 1;
  // The line's words are set here rather than read from the English chunk, so the test does not wait on the chunk's write
  const gameText: GameText = { ...ENGLISH_GAME_TEXT, [GameTextKey.ArtifactSetBonusLine]: "{0}-Piece Set: {1}" };
  const nameText = { "101": "Made-up effect.", "102": "Another made-up effect." };
  const createBonus = (descriptionTextHash: string, pieceCount: number): ActiveArtifactSetBonus => ({
    attributeLines: [{ attribute: Attribute.Health, value: 10 }],
    descriptionTextHash,
    params: [],
    pieceCount,
    setId: SET_ID,
  });

  test("each bonus is a line with its piece count and its effect's words", () => {
    expect.hasAssertions();

    expect(getArtifactSetBonusLines([createBonus("101", 2), createBonus("102", 4)], gameText, nameText)).toStrictEqual([
      "2-Piece Set: Made-up effect.",
      "4-Piece Set: Another made-up effect.",
    ]);
  });

  test("a bonus whose words the names do not hold has an empty effect", () => {
    expect.hasAssertions();

    expect(getArtifactSetBonusLines([createBonus("", 2)], gameText, nameText)).toStrictEqual(["2-Piece Set: "]);
  });

  test("no active bonus is no line", () => {
    expect.hasAssertions();

    expect(getArtifactSetBonusLines([], gameText, nameText)).toStrictEqual([]);
  });
});
