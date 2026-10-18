import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createYelanKitBehaviour, YELAN_CHARACTER_ID } from "#src/services/kit/characters/yelanKit";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { castKitAction, createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const YELAN_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, YELAN_CHARACTER_ID);
const createYelanCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: YELAN_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: YELAN_KIT,
  level: 90,
  weaponType: WeaponType.Bow,
});

describe(createYelanKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...YELAN_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(YELAN_KIT.chargedAttack.hits).talentMultiplier,
      YELAN_KIT.plungeCollision.talentMultiplier,
      takeOne(YELAN_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(YELAN_KIT.highPlunge.hits).talentMultiplier,
    ];
    const expectedMultipliers = [0.40678, 0.39044, 0.516, 0.32508, 1.24, 0.568288, 1.136335, 1.419344];
    expect(multipliers).toStrictEqual(expectedMultipliers);
  });

  test("the fully charged arrow lands at 96 frames, with its animation", () => {
    expect.hasAssertions();
    const arrowHitmark = Math.round(takeOne(YELAN_KIT.chargedAttack.hits).hitmarkSeconds * 60);

    expect(arrowHitmark).toBe(96);
    expect(Math.round(YELAN_KIT.chargedAttack.seconds * 60)).toBe(96);
  });

  test("lingering Lifeline's damage is a share of the caster's Max HP, and its cooldown is 10 seconds", () => {
    expect.hasAssertions();
    const lifelineHit = takeOne(YELAN_KIT.elementalSkill.hits);

    expect(lifelineHit.talentMultiplier).toBe(0);
    expect(lifelineHit.additiveBaseDamageBonus?.(createYelanCombatant())).toBeCloseTo(0.226136 * 10_000);
    expect(Math.round(lifelineHit.hitmarkSeconds * 60)).toBe(36);
    expect(YELAN_KIT.skillCooldownSeconds).toBe(10);
  });

  test("depth-Clarion Dice lasts 15 seconds from its hit, costs 70 energy and waves each second of it", () => {
    expect.hasAssertions();
    const field = castKitAction(YELAN_KIT.elementalBurst, createYelanCombatant()).effects.find(
      (effect): effect is KitField => effect.kind === "field",
    );
    const kitEffectState: KitEffectState = { effects: [] };
    field?.onTick(createKitTestContext(createYelanCombatant(), { kitEffectState }), 0);
    const throws = kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

    expect(field?.secondsRemaining).toBeCloseTo(76 / 60 + 15 + 0.1);
    expect(field?.tickIntervalSeconds).toBe(1);
    expect(YELAN_KIT.burstEnergyCost).toBe(70);
    expect(throws?.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))).toStrictEqual([20, 26, 32]);
  });

  test("a Lingering Lifeline hit throws Exquisite Throws only while Depth-Clarion Dice's field stands", () => {
    expect.hasAssertions();
    const lifelineHit = takeOne(YELAN_KIT.elementalSkill.hits);
    const strike = (effects: KitEffect[]): KitEffect[] => {
      const combatant = createYelanCombatant();
      const kitEffectState: KitEffectState = { effects };
      const context = createKitTestContext(combatant, { kitEffectState });
      lifelineHit.onStrike?.(context, { body: context.body, combatant, hit: lifelineHit });
      return kitEffectState.effects;
    };
    const field = castKitAction(YELAN_KIT.elementalBurst, createYelanCombatant()).effects.find(
      (effect): effect is KitField => effect.kind === "field",
    );

    expect(strike([]).filter((effect) => effect.kind === "summon")).toStrictEqual([]);
    expect(strike(field ? [field] : []).filter((effect) => effect.kind === "summon")).toHaveLength(1);
  });

  test("yelan's Breakthrough Barb is rolled on each Lingering Lifeline hit", () => {
    expect.hasAssertions();
    const lifelineHit = takeOne(YELAN_KIT.elementalSkill.hits);
    const rollStrike = (random: number): number => {
      const combatant = createYelanCombatant();
      const kitEffectState: KitEffectState = { effects: [] };
      const context = createKitTestContext(combatant, { kitEffectState, random: () => random });
      lifelineHit.onStrike?.(context, { body: context.body, combatant, hit: lifelineHit });
      return countKitResource(kitEffectState.effects, YELAN_CHARACTER_ID, "yelan-breakthrough-barb");
    };

    expect([rollStrike(0.33), rollStrike(0.34)]).toStrictEqual([1, 0]);
  });

  test("a Constellation 1 switch adds one Lingering Lifeline charge", () => {
    expect.hasAssertions();

    expect(YELAN_KIT.getSkillChargeBonus?.({ ...createYelanCombatant(), constellationCount: 1 })).toBe(1);
  });

  test("a Constellation 0 switch adds no Lingering Lifeline charge", () => {
    expect.hasAssertions();

    expect(YELAN_KIT.getSkillChargeBonus?.({ ...createYelanCombatant(), constellationCount: 0 })).toBe(0);
  });
});
