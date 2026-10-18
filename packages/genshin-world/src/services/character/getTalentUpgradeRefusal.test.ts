import type { Character } from "#src/models/character/Character";
import type { TalentUpgrade } from "#src/models/character/TalentUpgrade";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { CombatTalent } from "#src/models/character/CombatTalent";
import { TalentUpgradeRefusal } from "#src/models/character/TalentUpgradeRefusal";
import { Currency } from "#src/models/inventory/Currency";
import { getTalentUpgradeRefusal } from "#src/services/character/getTalentUpgradeRefusal";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(getTalentUpgradeRefusal, () => {
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

  test("a talent at its last level cannot be upgraded", () => {
    expect.hasAssertions();

    const lastLevelCharacter: Character = {
      ...CHARACTER,
      talentLevels: { ...CHARACTER.talentLevels, [CombatTalent.NormalAttack]: 10 },
    };

    expect(
      getTalentUpgradeRefusal(lastLevelCharacter, CombatTalent.NormalAttack, UPGRADES, {
        inventory: INVENTORY,
        wallet: WALLET,
      }),
    ).toStrictEqual(TalentUpgradeRefusal.LastLevel);
  });

  test("a talent past the character's phase shows the phase it needs", () => {
    expect.hasAssertions();

    expect(
      getTalentUpgradeRefusal({ ...CHARACTER, ascension: 1 }, CombatTalent.NormalAttack, UPGRADES, {
        inventory: INVENTORY,
        wallet: WALLET,
      }),
    ).toStrictEqual(TalentUpgradeRefusal.Phase);
  });

  test("a talent short of Mora shows the Mora it needs", () => {
    expect.hasAssertions();

    expect(
      getTalentUpgradeRefusal(CHARACTER, CombatTalent.NormalAttack, UPGRADES, {
        inventory: INVENTORY,
        wallet: { ...EMPTY_WALLET, [Currency.Mora]: 499 },
      }),
    ).toStrictEqual(TalentUpgradeRefusal.Mora);
  });

  test("a talent missing materials shows the materials it needs", () => {
    expect.hasAssertions();

    expect(
      getTalentUpgradeRefusal(CHARACTER, CombatTalent.NormalAttack, UPGRADES, {
        inventory: { items: [{ definition: MATERIAL, id: 0, quantity: 2 }], nextId: 1, quickSwapItemIds: [] },
        wallet: WALLET,
      }),
    ).toStrictEqual(TalentUpgradeRefusal.Materials);
  });

  test("a talent whose materials name one item twice needs both counts in the bag", () => {
    expect.hasAssertions();

    const upgrades: TalentUpgrade[] = [
      {
        coinCost: 500,
        costItems: [
          { count: 3, id: MATERIAL.id },
          { count: 3, id: MATERIAL.id },
        ],
        level: 2,
        phase: 2,
      },
    ];

    expect(
      getTalentUpgradeRefusal(CHARACTER, CombatTalent.NormalAttack, upgrades, { inventory: INVENTORY, wallet: WALLET }),
    ).toStrictEqual(TalentUpgradeRefusal.Materials);
  });

  test("a talent that meets every requirement can be upgraded", () => {
    expect.hasAssertions();

    expect(
      getTalentUpgradeRefusal(CHARACTER, CombatTalent.NormalAttack, UPGRADES, { inventory: INVENTORY, wallet: WALLET }),
    ).toBeUndefined();
  });
});
