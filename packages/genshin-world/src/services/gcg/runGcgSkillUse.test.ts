import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { createGcgDuel } from "#src/services/gcg/createGcgDuel";
import { prepareGcgSide } from "#src/services/gcg/prepareGcgSide";
import { readGcgDeck } from "#src/services/gcg/readGcgDeck";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { rerollGcgDice } from "#src/services/gcg/rerollGcgDice";
import { useGcgSkill } from "#src/services/gcg/useGcgSkill";
import { takeOne } from "@esposter/shared";
import { createSeededRandom } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe("a skill's on-use hooks", () => {
  const SEED = 9;
  const OCEANID_DECK_ID = 2;
  const TUTORIAL_DECK_ID = 1;
  const PYRONADO_SKILL_ID = 13_023;
  const XIANGLING_INDEX = 1;
  const DILUC_INDEX = 0;
  // Diluc at 10 HP, less the skill's 3 Pyro DMG and no more: the Pyronado it creates hears only the skills after it
  const DILUC_HP_AFTER_PYRONADO = 7;

  // A duel of the Oceanid deck against the tutorial deck, both sides prepared and rolled, the first side holding the given dice
  const openDuel = async (dice: Element[]): Promise<GcgDuel> => {
    const random = createSeededRandom(SEED);
    const duel = createGcgDuel(
      [
        await readGcgDeck(GAME_DATA_LOCAL_BASE_URL, OCEANID_DECK_ID),
        await readGcgDeck(GAME_DATA_LOCAL_BASE_URL, TUTORIAL_DECK_ID),
      ],
      random,
      await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL),
    );
    for (const sideIndex of [0, 1]) prepareGcgSide(duel, sideIndex, [], 0, random);
    for (const sideIndex of [0, 1]) rerollGcgDice(duel, sideIndex, [], random);
    takeOne(duel.sides, 0).dice = dice;
    return duel;
  };

  test("should not make the Pyronado a skill creates deal its own damage on the same use", async () => {
    expect.hasAssertions();

    const duel = await openDuel([Element.Pyro, Element.Pyro, Element.Pyro, Element.Pyro]);
    takeOne(duel.sides, 0).activeIndex = XIANGLING_INDEX;
    takeOne(takeOne(duel.sides, 0).characters, XIANGLING_INDEX).energy = 2;
    const result = useGcgSkill(duel, 0, PYRONADO_SKILL_ID, [0, 1, 2, 3]);

    expect({
      defenderHp: takeOne(takeOne(duel.sides, 1).characters, DILUC_INDEX).hp,
      onstages: takeOne(duel.sides, 0).onstages.map(({ cardId }) => cardId),
      result,
    }).toStrictEqual({ defenderHp: DILUC_HP_AFTER_PYRONADO, onstages: [113_022], result: GcgActionResult.Done });
  });
});
