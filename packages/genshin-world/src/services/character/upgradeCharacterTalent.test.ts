import type { Character } from "#src/models/character/Character";
import type { TalentUpgrade } from "#src/models/character/TalentUpgrade";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { CombatTalent } from "#src/models/character/CombatTalent";
import { Currency } from "#src/models/inventory/Currency";
import { upgradeCharacterTalent } from "#src/services/character/upgradeCharacterTalent";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { toCharacters } from "#src/services/save/toCharacters";
import { toCharacterSaves } from "#src/services/save/toCharacterSaves";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(upgradeCharacterTalent, () => {
  const CHARACTER: Character = {
    artifacts: [],
    ascension: 2,
    constellationCount: 0,
    friendshipExp: 0,
    id: 1,
    level: 20,
    stellaFortunaCount: 0,
    talentLevels: {
      [CombatTalent.ElementalBurst]: 1,
      [CombatTalent.ElementalSkill]: 1,
      [CombatTalent.NormalAttack]: 1,
    },
    weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 },
  };
  const OTHER_CHARACTER: Character = { ...CHARACTER, id: 2 };
  const MATERIAL: ItemDefinition = {
    category: ItemCategory.Material,
    id: 104_323,
    name: "",
    rank: 1,
    rarity: 1,
    stackLimit: 99,
  };
  const UPGRADES: TalentUpgrade[] = [{ coinCost: 500, costItems: [{ count: 3, id: MATERIAL.id }], level: 2, phase: 2 }];
  const INVENTORY = { items: [{ definition: MATERIAL, id: 0, quantity: 5 }], nextId: 1, quickSwapItemIds: [] };
  const WALLET = { ...EMPTY_WALLET, [Currency.Mora]: 500 };

  test("pressing Upgrade raises a talent by one and takes its Mora and materials", () => {
    expect.hasAssertions();

    expect(
      upgradeCharacterTalent([OTHER_CHARACTER, CHARACTER], CHARACTER, CombatTalent.NormalAttack, UPGRADES, {
        inventory: INVENTORY,
        wallet: WALLET,
      }),
    ).toStrictEqual({
      characters: [
        OTHER_CHARACTER,
        { ...CHARACTER, talentLevels: { ...CHARACTER.talentLevels, [CombatTalent.NormalAttack]: 2 } },
      ],
      inventory: { items: [{ definition: MATERIAL, id: 0, quantity: 2 }], nextId: 1, quickSwapItemIds: [] },
      wallet: EMPTY_WALLET,
    });
  });

  test("a raised talent is kept after a reload", () => {
    expect.hasAssertions();

    const { characters } = upgradeCharacterTalent([CHARACTER], CHARACTER, CombatTalent.NormalAttack, UPGRADES, {
      inventory: INVENTORY,
      wallet: WALLET,
    });

    expect(toCharacters(toCharacterSaves(characters, new Map()), new Map())).toStrictEqual(characters);
  });
});
