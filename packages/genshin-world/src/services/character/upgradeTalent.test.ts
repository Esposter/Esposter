import type { Character } from "#src/models/character/Character";
import type { TalentUpgrade } from "#src/models/character/TalentUpgrade";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { CombatTalent } from "#src/models/character/CombatTalent";
import { Currency } from "#src/models/inventory/Currency";
import { upgradeTalent } from "#src/services/character/upgradeTalent";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const CHARACTER: Character = {
  artifacts: [],
  ascension: 2,
  constellationCount: 0,
  id: 1,
  level: 20,
  stellaFortunaCount: 0,
  talentLevels: { [CombatTalent.ElementalBurst]: 1, [CombatTalent.ElementalSkill]: 1, [CombatTalent.NormalAttack]: 1 },
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

describe(upgradeTalent, () => {
  test("takes the level's Mora and items and raises the talent one level", () => {
    expect.hasAssertions();
    expect(
      upgradeTalent(CHARACTER, CombatTalent.NormalAttack, UPGRADES, {
        inventory: { items: [{ definition: MATERIAL, id: 0, quantity: 5 }], nextId: 1 },
        wallet: { ...EMPTY_WALLET, [Currency.Mora]: 500 },
      }),
    ).toStrictEqual({
      character: { ...CHARACTER, talentLevels: { ...CHARACTER.talentLevels, [CombatTalent.NormalAttack]: 2 } },
      inventory: { items: [{ definition: MATERIAL, id: 0, quantity: 2 }], nextId: 1 },
      wallet: EMPTY_WALLET,
    });
  });

  test("refuses a level whose ascension phase the character has not reached", () => {
    expect.hasAssertions();
    expect(() =>
      upgradeTalent({ ...CHARACTER, ascension: 1 }, CombatTalent.NormalAttack, UPGRADES, {
        inventory: { items: [{ definition: MATERIAL, id: 0, quantity: 5 }], nextId: 1 },
        wallet: { ...EMPTY_WALLET, [Currency.Mora]: 500 },
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: upgradeTalent, ascension 2 for NormalAttack]`,
    );
  });

  test("refuses a talent already at its last level", () => {
    expect.hasAssertions();
    expect(() =>
      upgradeTalent(CHARACTER, CombatTalent.NormalAttack, [], {
        inventory: { items: [{ definition: MATERIAL, id: 0, quantity: 5 }], nextId: 1 },
        wallet: { ...EMPTY_WALLET, [Currency.Mora]: 500 },
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: upgradeTalent, NormalAttack at its last level]`,
    );
  });

  test("refuses a level whose Mora the wallet cannot pay", () => {
    expect.hasAssertions();
    expect(() =>
      upgradeTalent(CHARACTER, CombatTalent.NormalAttack, UPGRADES, {
        inventory: { items: [{ definition: MATERIAL, id: 0, quantity: 5 }], nextId: 1 },
        wallet: { ...EMPTY_WALLET, [Currency.Mora]: 499 },
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: upgradeTalent, 500 Mora]`,
    );
  });
});
