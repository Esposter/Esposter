import type { Character } from "#src/models/character/Character";
import type { CharacterAscensionPhase } from "#src/models/character/CharacterAscensionPhase";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { CombatTalent } from "#src/models/character/CombatTalent";
import { Currency } from "#src/models/inventory/Currency";
import { ascendCharacter } from "#src/services/character/ascendCharacter";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(ascendCharacter, () => {
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
  const PHASES: CharacterAscensionPhase[] = [
    { attributeLines: [], coinCost: 0, costItems: [], maxLevel: 20, requiredPlayerLevel: 0 },
    {
      attributeLines: [],
      coinCost: 20_000,
      costItems: [{ count: 3, id: 112_044 }],
      maxLevel: 40,
      requiredPlayerLevel: 15,
    },
  ];
  const MATERIAL: ItemDefinition = {
    category: ItemCategory.Material,
    id: 112_044,
    name: "",
    rank: 1,
    rarity: 1,
    stackLimit: 99,
  };

  test("ascend spends the phase's materials and mora at its cap", () => {
    expect.hasAssertions();
    expect(
      ascendCharacter(CHARACTER, {
        adventureRank: 15,
        inventory: { items: [{ definition: MATERIAL, id: 0, quantity: 3 }], nextId: 1 },
        phases: PHASES,
        wallet: { ...EMPTY_WALLET, [Currency.Mora]: 20_000 },
      }),
    ).toStrictEqual({
      character: { ...CHARACTER, ascension: 1 },
      inventory: { items: [], nextId: 1 },
      wallet: { ...EMPTY_WALLET, [Currency.Mora]: 0 },
    });
  });

  test("ascend is refused while the next phase's cost is not in the table yet", () => {
    expect.hasAssertions();
    expect(
      ascendCharacter(CHARACTER, {
        adventureRank: 15,
        inventory: { items: [{ definition: MATERIAL, id: 0, quantity: 3 }], nextId: 1 },
        phases: [
          { attributeLines: [], maxLevel: 20 },
          { attributeLines: [], maxLevel: 40 },
        ],
        wallet: { ...EMPTY_WALLET, [Currency.Mora]: 20_000 },
      }),
    ).toBeUndefined();
  });

  test("ascend is refused below the phase's adventure rank", () => {
    expect.hasAssertions();
    expect(
      ascendCharacter(CHARACTER, {
        adventureRank: 14,
        inventory: { items: [{ definition: MATERIAL, id: 0, quantity: 3 }], nextId: 1 },
        phases: PHASES,
        wallet: { ...EMPTY_WALLET, [Currency.Mora]: 20_000 },
      }),
    ).toBeUndefined();
  });
});
