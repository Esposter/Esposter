import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { YELAN_CHARACTER_ID } from "#src/services/kit/characters/yelanKit";
import { createYelanKit } from "#src/services/kit/characters/yelanKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { createKitStepContext } from "#src/services/kit/createKitStepContext.test";

const YELAN_KIT = createYelanKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [YELAN_CHARACTER_ID]));

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

describe(createYelanKit, () => {
  const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
  // The effects an action's start adds, as the kit's effects hold them
  const castEffects = (action: KitAction): KitEffect[] => {
    const kitEffectState: KitEffectState = { effects: [] };
    action.onStart?.(createKitStepContext(createYelanCombatant(), { body: kitBody, kitEffectState }));
    return kitEffectState.effects;
  };

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

  test("Lingering Lifeline's damage is a share of the caster's Max HP, and its cooldown is 10 seconds", () => {
    expect.hasAssertions();
    const lifelineHit = takeOne(YELAN_KIT.elementalSkill.hits);

    expect(lifelineHit.talentMultiplier).toBe(0);
    expect(lifelineHit.additiveBaseDamageBonus?.(createYelanCombatant())).toBeCloseTo(0.226136 * 10_000);
    expect(Math.round(lifelineHit.hitmarkSeconds * 60)).toBe(36);
    expect(YELAN_KIT.skillCooldownSeconds).toBe(10);
  });

  test("Depth-Clarion Dice lasts 15 seconds from its hit, costs 70 energy and waves each second of it", () => {
    expect.hasAssertions();
    const field = castEffects(YELAN_KIT.elementalBurst).find((effect): effect is KitField => effect.kind === "field");
    const kitEffectState: KitEffectState = { effects: [] };
    field?.onTick({
      activeCombatant: createYelanCombatant(),
      characterIdCombatantMap: new Map([[YELAN_CHARACTER_ID, createYelanCombatant()]]),
      enemyMap: new Map(),
      kitEffectState,
      party: createParty([YELAN_CHARACTER_ID]),
      tickIndex: 0,
    });
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
      const kitEffectState: KitEffectState = { effects };
      lifelineHit.onStrike?.(createKitStepContext(createYelanCombatant(), { body: kitBody, kitEffectState }));
      return kitEffectState.effects;
    };
    const field = castEffects(YELAN_KIT.elementalBurst).find((effect): effect is KitField => effect.kind === "field");

    expect(strike([]).filter((effect) => effect.kind === "summon")).toStrictEqual([]);
    expect(strike(field ? [field] : []).filter((effect) => effect.kind === "summon")).toHaveLength(1);
  });
});
