import type { Character } from "#src/models/character/Character";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { CombatTalent } from "#src/models/character/CombatTalent";
import { Currency } from "#src/models/inventory/Currency";
import { ascendCharacter } from "#src/services/character/ascendCharacter";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { ascendWeapon } from "#src/services/weapon/ascendWeapon";
import { UPGRADABLE_WEAPON_DATA } from "#src/services/weapon/constants.test";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(ascendWeapon, () => {
  const CHARACTER: Character = {
    artifacts: [],
    ascension: 0,
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
    id: 114001,
    name: "",
    rank: 1,
    rarity: 1,
    stackLimit: 99,
  };

  test("takes the next phase's Mora and items and moves the weapon into it", () => {
    expect.hasAssertions();
    const weapon = { ascension: 0, experience: 0, id: 1, level: 20, refinement: 1 };
    expect(
      ascendWeapon(weapon, UPGRADABLE_WEAPON_DATA, {
        adventureRank: 15,
        inventory: { items: [{ definition: MATERIAL, id: 0, quantity: 5 }], nextId: 1, quickSwapItemIds: [] },
        wallet: { ...EMPTY_WALLET, [Currency.Mora]: 500 },
      }),
    ).toStrictEqual({
      inventory: { items: [{ definition: MATERIAL, id: 0, quantity: 2 }], nextId: 1, quickSwapItemIds: [] },
      wallet: EMPTY_WALLET,
      weapon: { ascension: 1, experience: 0, id: 1, level: 20, refinement: 1 },
    });
  });

  test("keeps the bag's equipped gadget when it takes the phase's items", () => {
    expect.hasAssertions();
    const weapon = { ascension: 0, experience: 0, id: 1, level: 20, refinement: 1 };
    expect(
      ascendWeapon(weapon, UPGRADABLE_WEAPON_DATA, {
        adventureRank: 15,
        inventory: {
          equippedGadgetItemId: 9,
          items: [{ definition: MATERIAL, id: 0, quantity: 5 }],
          nextId: 1,
          quickSwapItemIds: [],
        },
        wallet: { ...EMPTY_WALLET, [Currency.Mora]: 500 },
      }).inventory,
    ).toStrictEqual({
      equippedGadgetItemId: 9,
      items: [{ definition: MATERIAL, id: 0, quantity: 2 }],
      nextId: 1,
      quickSwapItemIds: [],
    });
  });

  test("refuses an Adventure Rank below the phase's requirement", () => {
    expect.hasAssertions();
    const weapon = { ascension: 0, experience: 0, id: 1, level: 20, refinement: 1 };
    expect(() =>
      ascendWeapon(weapon, UPGRADABLE_WEAPON_DATA, {
        adventureRank: 14,
        inventory: { items: [{ definition: MATERIAL, id: 0, quantity: 5 }], nextId: 1, quickSwapItemIds: [] },
        wallet: { ...EMPTY_WALLET, [Currency.Mora]: 500 },
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: ascendWeapon, AdventureRank]`,
    );
  });

  test("refuses a weapon below its phase's cap", () => {
    expect.hasAssertions();
    const weapon = { ascension: 0, experience: 0, id: 1, level: 19, refinement: 1 };
    expect(() =>
      ascendWeapon(weapon, UPGRADABLE_WEAPON_DATA, {
        adventureRank: 15,
        inventory: { items: [{ definition: MATERIAL, id: 0, quantity: 5 }], nextId: 1, quickSwapItemIds: [] },
        wallet: { ...EMPTY_WALLET, [Currency.Mora]: 500 },
      }),
    ).toThrowErrorMatchingInlineSnapshot(`[InvalidOperationError: Invalid operation: Update, name: ascendWeapon, Cap]`);
  });

  test("a character and a weapon at their cap pay the same phase cost through one rule", () => {
    expect.hasAssertions();
    const wallet = { ...EMPTY_WALLET, [Currency.Mora]: 500 };
    const inventory = { items: [{ definition: MATERIAL, id: 0, quantity: 3 }], nextId: 1, quickSwapItemIds: [] };
    const weapon = { ascension: 0, experience: 0, id: 1, level: 20, refinement: 1 };
    expect(
      ascendCharacter(CHARACTER, {
        adventureRank: 15,
        inventory,
        phases: UPGRADABLE_WEAPON_DATA.ascensionPhases,
        wallet,
      }),
    ).toStrictEqual({
      character: { ...CHARACTER, ascension: 1 },
      inventory: { items: [], nextId: 1, quickSwapItemIds: [] },
      wallet: EMPTY_WALLET,
    });
    expect(ascendWeapon(weapon, UPGRADABLE_WEAPON_DATA, { adventureRank: 15, inventory, wallet })).toStrictEqual({
      inventory: { items: [], nextId: 1, quickSwapItemIds: [] },
      wallet: EMPTY_WALLET,
      weapon: { ascension: 1, experience: 0, id: 1, level: 20, refinement: 1 },
    });
    const shortInventory = { items: [{ definition: MATERIAL, id: 0, quantity: 2 }], nextId: 1, quickSwapItemIds: [] };
    expect(
      ascendCharacter(CHARACTER, {
        adventureRank: 15,
        inventory: shortInventory,
        phases: UPGRADABLE_WEAPON_DATA.ascensionPhases,
        wallet,
      }),
    ).toBeUndefined();
    expect(() =>
      ascendWeapon(weapon, UPGRADABLE_WEAPON_DATA, { adventureRank: 15, inventory: shortInventory, wallet }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: ascendWeapon, Materials]`,
    );
  });
});
