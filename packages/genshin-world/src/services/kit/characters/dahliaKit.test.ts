import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitShield } from "#src/models/kit/KitShield";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createDahliaKitBehaviour, DAHLIA_CHARACTER_ID } from "#src/services/kit/characters/dahliaKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const DAHLIA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, DAHLIA_CHARACTER_ID);
const createDahliaCombatant = (constellationCount = 0): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseDefense, value: 1000 }]),
  characterId: DAHLIA_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: DAHLIA_KIT,
  level: 90,
  weaponType: WeaponType.Sword,
});

// The shield Radiant Psalter places once its task runs, read off the field its task is held in
const castRadiantPsalterShield = (constellationCount: number): KitShield => {
  const combatant = createDahliaCombatant(constellationCount);
  const kitEffectState: KitEffectState = { effects: [] };
  const context = createKitTestContext(combatant, { kitEffectState });
  DAHLIA_KIT.elementalBurst.onStart?.(context);
  const field = takeOne(kitEffectState.effects.filter((effect): effect is KitField => effect.kind === "field"));
  field.onTick(context, 0);
  return takeOne(kitEffectState.effects.filter((effect): effect is KitShield => effect.kind === "shield"));
};

describe(createDahliaKitBehaviour, () => {
  test("an active constellation's switch changes its character's kit", () => {
    expect.hasAssertions();

    expect(castRadiantPsalterShield(4).secondsRemaining).toBe(15);
  });

  test("an inactive constellation changes nothing", () => {
    expect.hasAssertions();

    expect(castRadiantPsalterShield(3).secondsRemaining).toBe(12);
  });

  test("reads each talent multiplier from her proud skill groups, to four decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...DAHLIA_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...DAHLIA_KIT.chargedAttack.hits.map((hit) => hit.talentMultiplier),
      DAHLIA_KIT.plungeCollision.talentMultiplier,
      takeOne(DAHLIA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(DAHLIA_KIT.highPlunge.hits).talentMultiplier,
      takeOne(DAHLIA_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(DAHLIA_KIT.elementalBurst.hits).talentMultiplier,
    ].map((multiplier) => Number(multiplier.toFixed(4)));

    expect(multipliers).toStrictEqual([
      0.4355, 0.401, 0.2374, 0.6566, 0.3988, 0.5507, 0.6393, 1.2784, 1.5968, 2.328, 4.064,
    ]);
  });

  test("reads her stamina, her cooldowns and her burst's energy cost from her proud skill groups", () => {
    expect.hasAssertions();
    expect([
      DAHLIA_KIT.chargedAttackStamina,
      DAHLIA_KIT.skillCooldownSeconds,
      DAHLIA_KIT.burstCooldownSeconds,
      DAHLIA_KIT.burstEnergyCost,
    ]).toStrictEqual([20, 9, 15, 60]);
  });

  test("lands her strikes at their hitmarks, her charged attack at 10 frames, her skill's tap at 27 and hold at 28, and her burst at 30", () => {
    expect.hasAssertions();
    expect({
      burstHitmarkFrames: DAHLIA_KIT.elementalBurst.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
      chargedAttackHitmarkFrames: DAHLIA_KIT.chargedAttack.hits.map(({ hitmarkSeconds }) =>
        Math.round(hitmarkSeconds * 60),
      ),
      normalAttackHitmarkFrames: DAHLIA_KIT.normalAttacks.map(({ hits }) =>
        Math.round(takeOne(hits).hitmarkSeconds * 60),
      ),
      skillHitmarkFrames: DAHLIA_KIT.elementalSkill.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
      skillHoldHitmarkFrames: takeOne(DAHLIA_KIT.elementalSkillHolds ?? []).action.hits.map(({ hitmarkSeconds }) =>
        Math.round(hitmarkSeconds * 60),
      ),
    }).toStrictEqual({
      burstHitmarkFrames: [30],
      chargedAttackHitmarkFrames: [10, 10],
      normalAttackHitmarkFrames: [15, 13, 14, 21],
      skillHitmarkFrames: [27],
      skillHoldHitmarkFrames: [28],
    });
  });

  test("her burst places a shield 31 frames in, priced by her Max HP and the table's flat HP, for the seconds its Favonian Favor holds", () => {
    expect.hasAssertions();
    const combatant = createDahliaCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(combatant, { kitEffectState });
    DAHLIA_KIT.elementalBurst.onStart?.(context);
    const field = takeOne(kitEffectState.effects.filter((effect): effect is KitField => effect.kind === "field"));
    expect(field.nextTickSeconds).toBeCloseTo(31 / 60);

    field.onTick(context, 0);
    const shield = takeOne(kitEffectState.effects.filter((effect): effect is KitShield => effect.kind === "shield"));
    expect(shield.health).toBeCloseTo(0.0336 * combatant.attributes.maxHealth + 323.5577);
    expect(shield.secondsRemaining).toBe(12);
  });
});
