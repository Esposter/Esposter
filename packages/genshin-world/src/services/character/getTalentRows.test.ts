import type { Character } from "#src/models/character/Character";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { CombatTalent } from "#src/models/character/CombatTalent";
import { TalentUpgradeRefusal } from "#src/models/character/TalentUpgradeRefusal";
import { Currency } from "#src/models/inventory/Currency";
import { getTalentRows } from "#src/services/character/getTalentRows";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(getTalentRows, () => {
  const CHARACTER: Character = {
    artifacts: [],
    ascension: 2,
    constellationCount: 0,
    friendshipExp: 0,
    id: 1,
    level: 20,
    stellaFortunaCount: 0,
    talentLevels: {
      [CombatTalent.ElementalBurst]: 10,
      [CombatTalent.ElementalSkill]: 10,
      [CombatTalent.NormalAttack]: 1,
    },
    weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 },
  };
  const TALENT_GROUP_IDS = {
    [CombatTalent.ElementalBurst]: 3,
    [CombatTalent.ElementalSkill]: 2,
    [CombatTalent.NormalAttack]: 1,
  };
  const MATERIAL: ItemDefinition = {
    category: ItemCategory.Material,
    id: 104_323,
    name: "",
    rank: 1,
    rarity: 1,
    stackLimit: 99,
  };
  const UPGRADES = [{ coinCost: 500, costItems: [{ count: 3, id: MATERIAL.id }], level: 2, phase: 2 }];
  const TALENT_UPGRADE_MAP = { 1: UPGRADES };
  const INVENTORY = { items: [{ definition: MATERIAL, id: 0, quantity: 5 }], nextId: 1 };
  const WALLET = { ...EMPTY_WALLET, [Currency.Mora]: 500 };

  test("a talent row shows its next level's phase and cost", () => {
    expect.hasAssertions();

    expect(
      getTalentRows(CHARACTER, TALENT_GROUP_IDS, TALENT_UPGRADE_MAP, { inventory: INVENTORY, wallet: WALLET }),
    ).toStrictEqual([
      { level: 1, refusal: undefined, talent: CombatTalent.NormalAttack, upgrade: UPGRADES[0] },
      { level: 10, refusal: TalentUpgradeRefusal.LastLevel, talent: CombatTalent.ElementalSkill, upgrade: undefined },
      { level: 10, refusal: TalentUpgradeRefusal.LastLevel, talent: CombatTalent.ElementalBurst, upgrade: undefined },
    ]);
  });

  test("a talent at its last level cannot be upgraded", () => {
    expect.hasAssertions();

    const lastLevelCharacter: Character = {
      ...CHARACTER,
      talentLevels: {
        [CombatTalent.ElementalBurst]: 10,
        [CombatTalent.ElementalSkill]: 10,
        [CombatTalent.NormalAttack]: 10,
      },
    };

    expect(
      getTalentRows(lastLevelCharacter, TALENT_GROUP_IDS, TALENT_UPGRADE_MAP, { inventory: INVENTORY, wallet: WALLET }),
    ).toStrictEqual([
      { level: 10, refusal: TalentUpgradeRefusal.LastLevel, talent: CombatTalent.NormalAttack, upgrade: undefined },
      { level: 10, refusal: TalentUpgradeRefusal.LastLevel, talent: CombatTalent.ElementalSkill, upgrade: undefined },
      { level: 10, refusal: TalentUpgradeRefusal.LastLevel, talent: CombatTalent.ElementalBurst, upgrade: undefined },
    ]);
  });
});
