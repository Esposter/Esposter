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

  test("should name a weapon card's weapon kind from its tag, as a character's weapon is named", () => {
    expect.hasAssertions();

    const WEAPON_CARD_ID = 311_503;
    const deckRow: ExcelGcgDeckRow = { cardList: [WEAPON_CARD_ID], characterList: [], id: DECK_ID };
    const weaponRow: ExcelGcgCardRow = {
      cardType: "GCG_CARD_MODIFY",
      costList: [],
      descTextMapHash: CARD_DESCRIPTION_TEXT_ID,
      id: WEAPON_CARD_ID,
      nameTextMapHash: CARD_NAME_TEXT_ID,
      skillList: [],
      tagList: ["GCG_TAG_WEAPON", "GCG_TAG_WEAPON_SWORD"],
    };

    expect(toGcgDeck(deckRow, [], [], [weaponRow], [], []).cards).toStrictEqual([
      {
        costs: [],
        descriptionTextId: CARD_DESCRIPTION_TEXT_ID,
        effects: [],
        id: WEAPON_CARD_ID,
        isLocation: false,
        kind: GcgCardKind.Weapon,
        nameTextId: CARD_NAME_TEXT_ID,
        weapon: "SWORD",
      },
    ]);
  });

  test("should name a character's nation from its tag", () => {
    expect.hasAssertions();

    const LIYUE_CHARACTER_ID = 1_107;
    const deckRow: ExcelGcgDeckRow = { cardList: [], characterList: [LIYUE_CHARACTER_ID], id: DECK_ID };
    const characterRow: ExcelGcgCharRow = {
      descTextMapHash: CHARACTER_DESCRIPTION_TEXT_ID,
      hp: 10,
      id: LIYUE_CHARACTER_ID,
      maxEnergy: 3,
      nameTextMapHash: CHARACTER_NAME_TEXT_ID,
      skillList: [],
      tagList: ["GCG_TAG_ELEMENT_CRYO", "GCG_TAG_WEAPON_POLE", "GCG_TAG_NATION_LIYUE"],
    };

    expect(toGcgDeck(deckRow, [characterRow], [], [], [], []).characters).toStrictEqual([
      {
        descriptionTextId: CHARACTER_DESCRIPTION_TEXT_ID,
        element: Element.Cryo,
        hp: 10,
        id: LIYUE_CHARACTER_ID,
        maxEnergy: 3,
        nameTextId: CHARACTER_NAME_TEXT_ID,
        nation: "LIYUE",
        skills: [],
        weapon: "POLE",
      },
    ]);
  });

  test("should mark a companion support card from its ally tag", () => {
    expect.hasAssertions();

    const COMPANION_CARD_ID = 322_012;
    const deckRow: ExcelGcgDeckRow = { cardList: [COMPANION_CARD_ID], characterList: [], id: DECK_ID };
    const companionRow: ExcelGcgCardRow = {
      cardType: "GCG_CARD_ASSIST",
      costList: [],
      descTextMapHash: CARD_DESCRIPTION_TEXT_ID,
      id: COMPANION_CARD_ID,
      nameTextMapHash: CARD_NAME_TEXT_ID,
      skillList: [],
      tagList: ["GCG_TAG_ALLY"],
    };

    expect(toGcgDeck(deckRow, [], [], [companionRow], [], []).cards).toStrictEqual([
      {
        costs: [],
        descriptionTextId: CARD_DESCRIPTION_TEXT_ID,
        effects: [],
        id: COMPANION_CARD_ID,
        isCompanion: true,
        isLocation: false,
        kind: GcgCardKind.Support,
        nameTextId: CARD_NAME_TEXT_ID,
      },
    ]);
  });

  test("should leave out an empty cost slot, which the dump writes with no cost type", () => {
    expect.hasAssertions();

    const deckRow: ExcelGcgDeckRow = { cardList: [], characterList: [CHARACTER_ID], id: DECK_ID };
    const characterRow: ExcelGcgCharRow = {
      descTextMapHash: CHARACTER_DESCRIPTION_TEXT_ID,
      hp: 10,
      id: CHARACTER_ID,
      maxEnergy: 3,
      nameTextMapHash: CHARACTER_NAME_TEXT_ID,
      skillList: [SKILL_ID],
      tagList: ["GCG_TAG_ELEMENT_PYRO"],
    };
    const skillRow: ExcelGcgSkillRow = {
      costList: [{ count: 0 }],
      energyRecharge: 1,
      id: SKILL_ID,
      skillJson: "Effect_Damage_Fire_1",
      skillTagList: ["GCG_SKILL_TAG_A"],
    };

    expect(toGcgDeck(deckRow, [characterRow], [skillRow], [], [], [])).toStrictEqual({
      cardIds: [],
      cards: [],
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
          weapon: "",
        },
      ],
    });
  });
});
