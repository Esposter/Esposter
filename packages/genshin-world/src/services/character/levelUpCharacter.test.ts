import type { Character } from "#src/models/character/Character";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { CombatTalent } from "#src/models/character/CombatTalent";
import { Currency } from "#src/models/inventory/Currency";
import { levelUpCharacter } from "#src/services/character/levelUpCharacter";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(levelUpCharacter, () => {
  const CHARACTER: Character = {
    artifacts: [],
    ascension: 1,
    constellationCount: 0,
    friendshipExp: 0,
    id: 1,
    level: 7,
    stellaFortunaCount: 0,
    talentLevels: {
      [CombatTalent.ElementalBurst]: 1,
      [CombatTalent.ElementalSkill]: 1,
      [CombatTalent.NormalAttack]: 1,
    },
    weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 },
  };
  const ADVENTURERS_EXPERIENCE: ItemDefinition = {
    category: ItemCategory.Material,
    id: 104_002,
    name: "",
    rank: 1,
    rarity: 1,
    stackLimit: 99,
  };
  const WANDERERS_ADVICE: ItemDefinition = { ...ADVENTURERS_EXPERIENCE, id: 104_001 };

  // Level 7 needs 3,725 Character EXP to reach level 8: one Adventurer's Experience covers it, at 1,000 Mora for its 5,000
  test("level up spends character exp materials", () => {
    expect.hasAssertions();
    expect(
      levelUpCharacter(CHARACTER, {
        inventory: {
          items: [{ definition: ADVENTURERS_EXPERIENCE, id: 0, quantity: 1 }],
          nextId: 1,
          quickSwapItemIds: [],
        },
        maxLevel: 20,
        wallet: { ...EMPTY_WALLET, [Currency.Mora]: 1000 },
      }),
    ).toStrictEqual({
      character: { ...CHARACTER, level: 8 },
      inventory: { items: [], nextId: 1, quickSwapItemIds: [] },
      wallet: { ...EMPTY_WALLET, [Currency.Mora]: 0 },
    });
  });

  // Three Wanderer's Advice give 3,000 of the 3,725 the level needs, so nothing is taken and the level is not raised
  test("level up is refused without enough character exp materials", () => {
    expect.hasAssertions();
    expect(
      levelUpCharacter(CHARACTER, {
        inventory: { items: [{ definition: WANDERERS_ADVICE, id: 0, quantity: 3 }], nextId: 1, quickSwapItemIds: [] },
        maxLevel: 20,
        wallet: { ...EMPTY_WALLET, [Currency.Mora]: 1000 },
      }),
    ).toBeUndefined();
  });
});
