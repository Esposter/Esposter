import type { Combatant } from "#src/models/kit/Combatant";
import type { KitField } from "#src/models/kit/KitField";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createKokomiKitBehaviour, KOKOMI_CHARACTER_ID } from "#src/services/kit/characters/kokomiKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const KOKOMI_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, KOKOMI_CHARACTER_ID);

const MAX_HEALTH = 10_000;

const createKokomiCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
  characterId: KOKOMI_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: KOKOMI_KIT,
  level: 90,
  weaponType: WeaponType.Catalyst,
});

// Bake-Kurage on the field with the given seconds left, then Nereid's Ascension cast at the given ascension
const readBakeKurageSeconds = (ascension: number): number | undefined => {
  const combatant = { ...createKokomiCombatant(), ascension };
  const context = createKitTestContext(combatant);
  KOKOMI_KIT.elementalSkill.onStart?.(context);
  const findField = () => context.kitEffectState.effects.find((effect): effect is KitField => effect.kind === "field");
  const field = findField();
  if (field) field.secondsRemaining = 1;
  KOKOMI_KIT.elementalBurst.onStart?.(context);
  return findField()?.secondsRemaining;
};

// The bonus the garment's first normal attack adds to its damage, as Kokomi holds the given Healing Bonus
const readGarmentBonus = (ascension: number): number => {
  const combatant = {
    ...createKokomiCombatant(),
    ascension,
    attributes: computeCharacterAttributes([
      { attribute: Attribute.BaseHealth, value: MAX_HEALTH },
      { attribute: Attribute.HealingBonus, value: 0.8 },
    ]),
  };
  const context = createKitTestContext(combatant);
  KOKOMI_KIT.elementalBurst.onStart?.(context);
  const garment = context.kitEffectState.effects.find((effect) => effect.kind === "stance");
  if (garment?.kind !== "stance") throw new Error("Nereid's Ascension starts no garment");
  const [firstNormalAttack] = garment.combatant.kit.normalAttacks;
  return firstNormalAttack?.hits[0]?.additiveBaseDamageBonus?.(combatant) ?? 0;
};

describe(createKokomiKitBehaviour, () => {
  test("nereid's ascension's garment gives Kokomi's normal attacks a share of her Max HP to their damage, for ten seconds", () => {
    expect.hasAssertions();
    const combatant = createKokomiCombatant();
    const context = createKitTestContext(combatant);

    KOKOMI_KIT.elementalBurst.onStart?.(context);
    const garment = context.kitEffectState.effects.find((effect) => effect.kind === "stance");
    if (garment?.kind !== "stance") throw new Error("Nereid's Ascension starts no garment");
    const [firstNormalAttack] = garment.combatant.kit.normalAttacks;
    const bonus = firstNormalAttack?.hits[0]?.additiveBaseDamageBonus?.(combatant);

    expect(garment.secondsRemaining).toBe(10);
    expect(bonus).toBeCloseTo(0.0484 * MAX_HEALTH);
  });
});

describe("flawless Strategy", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();
    const combatant = { ...createKokomiCombatant(), ascension: 0 };

    expect(KOKOMI_KIT.getPassiveBonuses?.(combatant, 1, [])).toStrictEqual([
      { amount: 0.25, attribute: Attribute.HealingBonus },
      { amount: -1, attribute: Attribute.CriticalRate },
    ]);
  });
});

describe("tamakushi Casket", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(readBakeKurageSeconds(1)).toBe(12.5);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(readBakeKurageSeconds(0)).toBe(1);
  });
});

describe("song of Pearls", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(readGarmentBonus(4)).toBeCloseTo(0.0484 * MAX_HEALTH + 0.15 * 0.8 * MAX_HEALTH);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(readGarmentBonus(3)).toBeCloseTo(0.0484 * MAX_HEALTH);
  });
});
