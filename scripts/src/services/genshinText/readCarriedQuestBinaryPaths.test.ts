import { readCarriedQuestBinaryPaths } from "#src/services/genshinText/readCarriedQuestBinaryPaths";
import { describe, expect, test } from "vitest";

describe(readCarriedQuestBinaryPaths, () => {
  // A world quest with its own main row, and a sub quest of another world quest, which its binary is named by
  const OWN_MAIN_ID = 311;
  const SUB_ID = 7280801;
  const SUB_MAIN_ID = 72808;
  const UNTABLED_ID = 1;
  const mainQuests = [{ id: OWN_MAIN_ID }, { id: SUB_MAIN_ID }];
  const subQuests = [{ mainId: SUB_MAIN_ID, subId: SUB_ID }];

  test("requests each carried quest's binary by its main quest, a sub quest's by the world quest it is part of", () => {
    expect.hasAssertions();

    expect(readCarriedQuestBinaryPaths([String(OWN_MAIN_ID), String(SUB_ID)], mainQuests, subQuests)).toStrictEqual([
      `BinOutput/Quest/${OWN_MAIN_ID}.json`,
      `BinOutput/Quest/${SUB_MAIN_ID}.json`,
    ]);
  });

  test("requests a binary once however many carried quests read it, and none for a quest with no row", () => {
    expect.hasAssertions();

    expect(
      readCarriedQuestBinaryPaths([String(SUB_ID), String(SUB_MAIN_ID), String(UNTABLED_ID)], mainQuests, subQuests),
    ).toStrictEqual([`BinOutput/Quest/${SUB_MAIN_ID}.json`]);
  });
});
