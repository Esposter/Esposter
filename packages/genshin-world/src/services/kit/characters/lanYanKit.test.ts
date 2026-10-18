import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createLanYanKitBehaviour, LAN_YAN_CHARACTER_ID } from "#src/services/kit/characters/lanYanKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const LAN_YAN_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, LAN_YAN_CHARACTER_ID);
const createLanYanCombatant = (constellationCount: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: LAN_YAN_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: LAN_YAN_KIT,
  level: 90,
  weaponType: WeaponType.Catalyst,
});

const castEffects = (constellationCount: number): KitEffect[] => {
  const kitEffectState: KitEffectState = { effects: [] };
  LAN_YAN_KIT.elementalBurst.onStart?.(
    createKitTestContext(createLanYanCombatant(constellationCount), { kitEffectState }),
  );
  return kitEffectState.effects;
};

describe(createLanYanKitBehaviour, () => {
  test("reads each talent multiplier from her proud skill groups, to four decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...LAN_YAN_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      ...LAN_YAN_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      LAN_YAN_KIT.plungeCollision.talentMultiplier,
      LAN_YAN_KIT.lowPlunge.hits[0]?.talentMultiplier,
      LAN_YAN_KIT.highPlunge.hits[0]?.talentMultiplier,
      LAN_YAN_KIT.elementalBurst.hits[0]?.talentMultiplier,
    ].map((multiplier) => Number(multiplier?.toFixed(4)));

    expect(multipliers).toStrictEqual([
      0.4144, 0.2041, 0.2495, 0.2692, 0.2692, 0.6456, 0.3784, 0.3784, 0.3784, 0.5683, 1.1363, 1.4193, 2.4106,
    ]);
    expect([
      LAN_YAN_KIT.chargedAttackStamina,
      LAN_YAN_KIT.skillCooldownSeconds,
      LAN_YAN_KIT.burstCooldownSeconds,
      LAN_YAN_KIT.burstEnergyCost,
    ]).toStrictEqual([50, 16, 15, 60]);
  });

  test("lands her charged attack's three hits at 42, 49 and 56 frames, her burst's three at 30, 46 and 51, and her collision at 38", () => {
    expect.hasAssertions();
    expect({
      burstHitmarkFrames: LAN_YAN_KIT.elementalBurst.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
      chargedAttackHitmarkFrames: LAN_YAN_KIT.chargedAttack.hits.map(({ hitmarkSeconds }) =>
        Math.round(hitmarkSeconds * 60),
      ),
      collisionHitmarkFrames: Math.round(LAN_YAN_KIT.plungeCollision.hitmarkSeconds * 60),
    }).toStrictEqual({
      burstHitmarkFrames: [30, 46, 51],
      chargedAttackHitmarkFrames: [42, 49, 56],
      collisionHitmarkFrames: 38,
    });
  });

  test("adds 60 Elemental Mastery to each member of the deployed team for 12 seconds from Constellation 4", () => {
    expect.hasAssertions();

    expect(castEffects(3)).toStrictEqual([]);
    expect(castEffects(4)).toStrictEqual([
      {
        amount: 60,
        attribute: Attribute.ElementalMastery,
        characterId: LAN_YAN_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 12,
        source: "lanyan-c4",
      },
    ]);
  });

  test("an active constellation's switch changes its character's kit", () => {
    expect.hasAssertions();
    expect(LAN_YAN_KIT.getSkillChargeBonus?.(createLanYanCombatant(6))).toBe(1);
  });

  test("an inactive constellation changes nothing", () => {
    expect.hasAssertions();
    expect(LAN_YAN_KIT.getSkillChargeBonus?.(createLanYanCombatant(5))).toBe(0);
  });
});

// Lustrous Moonrise's hits' flat damage from Elemental Mastery, with Lan Yan at the given ascension
const readBurstBonuses = (ascension: number): number[] => {
  const combatant = {
    ...createLanYanCombatant(0),
    ascension,
    attributes: computeCharacterAttributes([{ attribute: Attribute.ElementalMastery, value: 1000 }]),
  };
  return LAN_YAN_KIT.elementalBurst.hits.map((hit) => hit.additiveBaseDamageBonus?.(combatant) ?? 0);
};

describe("skyfeather Evil-Subduing Charm", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(readBurstBonuses(4)).toStrictEqual(LAN_YAN_KIT.elementalBurst.hits.map(() => 7.74 * 1000));
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(readBurstBonuses(3)).toStrictEqual(LAN_YAN_KIT.elementalBurst.hits.map(() => 0));
  });
});
