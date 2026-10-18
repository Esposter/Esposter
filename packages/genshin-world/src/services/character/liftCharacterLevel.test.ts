import type { Character } from "#src/models/character/Character";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { CombatTalent } from "#src/models/character/CombatTalent";
import { MASTERLESS_STELLA_FORTUNA_ID } from "#src/services/character/constants";
import { liftCharacterLevel } from "#src/services/character/liftCharacterLevel";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(liftCharacterLevel, () => {
  const CHARACTER: Character = {
    artifacts: [],
    ascension: 6,
    constellationCount: 0,
    friendshipExp: 0,
    id: 1,
    level: 90,
    stellaFortunaCount: 0,
    talentLevels: {
      [CombatTalent.ElementalBurst]: 1,
      [CombatTalent.ElementalSkill]: 1,
      [CombatTalent.NormalAttack]: 1,
    },
    weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 },
  };
  const MASTERLESS_STELLA_FORTUNA: ItemDefinition = {
    category: ItemCategory.Material,
    id: MASTERLESS_STELLA_FORTUNA_ID,
    name: "",
    rank: 1,
    rarity: 1,
    stackLimit: 99,
  };

  test("masterless stella fortuna lifts a character from level 90 to 95", () => {
    expect.hasAssertions();
    expect(
      liftCharacterLevel(CHARACTER, {
        inventory: {
          items: [{ definition: MASTERLESS_STELLA_FORTUNA, id: 0, quantity: 1 }],
          nextId: 1,
          quickSwapItemIds: [],
        },
      }),
    ).toStrictEqual({
      character: { ...CHARACTER, level: 95 },
      inventory: { items: [], nextId: 1, quickSwapItemIds: [] },
    });
  });

  test("masterless stella fortuna lifts a character from level 95 to 100", () => {
    expect.hasAssertions();
    const character = { ...CHARACTER, level: 95 };
    expect(
      liftCharacterLevel(character, {
        inventory: {
          items: [{ definition: MASTERLESS_STELLA_FORTUNA, id: 0, quantity: 2 }],
          nextId: 1,
          quickSwapItemIds: [],
        },
      }),
    ).toStrictEqual({
      character: { ...character, level: 100 },
      inventory: { items: [], nextId: 1, quickSwapItemIds: [] },
    });
  });
});
