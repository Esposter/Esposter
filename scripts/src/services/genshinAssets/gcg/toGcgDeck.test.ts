import type { ExcelGcgCardRow } from "#src/models/genshinAssets/gcg/ExcelGcgCardRow";
import type { ExcelGcgCharRow } from "#src/models/genshinAssets/gcg/ExcelGcgCharRow";
import type { ExcelGcgDeckRow } from "#src/models/genshinAssets/gcg/ExcelGcgDeckRow";
import type { ExcelGcgSkillRow } from "#src/models/genshinAssets/gcg/ExcelGcgSkillRow";

import { toGcgDeck } from "#src/services/genshinAssets/gcg/toGcgDeck";
import { Element, GcgCardKind, GcgSkillKind } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toGcgDeck, () => {
  const DECK_ID = 1;
  const CARD_ID = 213_011;
  const CHARACTER_ID = 1301;
  const SKILL_ID = 13_011;
  const CHARACTER_NAME_TEXT_ID = 1001;
  const CHARACTER_DESCRIPTION_TEXT_ID = 1002;
  const CARD_NAME_TEXT_ID = 2001;
  const CARD_DESCRIPTION_TEXT_ID = 2002;

  test("should write each character's and each card's name and description text ids into their own fields", () => {
    expect.hasAssertions();

    const deckRow: ExcelGcgDeckRow = { cardList: [CARD_ID], characterList: [CHARACTER_ID], id: DECK_ID };
    const characterRow: ExcelGcgCharRow = {
      descTextMapHash: CHARACTER_DESCRIPTION_TEXT_ID,
      hp: 10,
      id: CHARACTER_ID,
      maxEnergy: 3,
      nameTextMapHash: CHARACTER_NAME_TEXT_ID,
      skillList: [SKILL_ID],
      tagList: ["GCG_TAG_ELEMENT_PYRO", "GCG_TAG_WEAPON_SWORD"],
    };
    const skillRow: ExcelGcgSkillRow = {
      costList: [],
      energyRecharge: 1,
      id: SKILL_ID,
      skillJson: "Effect_Damage_Fire_1",
      skillTagList: ["GCG_SKILL_TAG_A"],
    };
    const cardRow: ExcelGcgCardRow = {
      cardType: "GCG_CARD_EVENT",
      costList: [],
      descTextMapHash: CARD_DESCRIPTION_TEXT_ID,
      id: CARD_ID,
      nameTextMapHash: CARD_NAME_TEXT_ID,
      skillList: [],
      tagList: [],
    };

    expect(toGcgDeck(deckRow, [characterRow], [skillRow], [cardRow], [], [])).toStrictEqual({
      cardIds: [CARD_ID],
      cards: [
        {
          costs: [],
          descriptionTextId: CARD_DESCRIPTION_TEXT_ID,
          effects: [],
          id: CARD_ID,
          isLocation: false,
          kind: GcgCardKind.Event,
          nameTextId: CARD_NAME_TEXT_ID,
        },
      ],
      characterIds: [CHARACTER_ID],
      characters: [
        {
          descriptionTextId: CHARACTER_DESCRIPTION_TEXT_ID,
          element: Element.Pyro,
          hp: 10,
          id: CHARACTER_ID,
          maxEnergy: 3,
          nameTextId: CHARACTER_NAME_TEXT_ID,
          skills: [
            { costs: [], effect: "Effect_Damage_Fire_1", energyGain: 1, id: SKILL_ID, kind: GcgSkillKind.NormalAttack },
          ],
          weapon: "SWORD",
        },
      ],
    });
  });
});
