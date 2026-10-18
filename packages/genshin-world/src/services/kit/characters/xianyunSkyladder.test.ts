import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import {
  createXianyunKitBehaviour,
  XIANYUN_CHARACTER_ID,
  XIANYUN_CONSTELLATION_4_ICD_ID,
  XIANYUN_CONSTELLATION_6_ID,
  XIANYUN_DRIFTCLOUD_ID,
  XIANYUN_SKYLADDER_STATE_ID,
} from "#src/services/kit/characters/xianyunKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { assert, describe, expect, test } from "vitest";

const createCombatant = (constellationCount: number): Combatant =>
  ({
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: XIANYUN_CHARACTER_ID,
    constellationCount,
    elementalResonances: [],
    kit: { getPassiveBonuses: undefined },
    level: 90,
  }) as unknown as Combatant;

describe(createXianyunKitBehaviour, () => {
  test("a Skyladder press sets the Cloud Transmogrification state at one press", () => {
    expect.hasAssertions();

    const context = createKitTestContext(createCombatant(0));
    createXianyunKitBehaviour().skill?.onStart?.(context);

    expect(countKitResource(context.kitEffectState.effects, XIANYUN_CHARACTER_ID, XIANYUN_SKYLADDER_STATE_ID)).toBe(1);
  });

  test("a chained Skyladder press counts up to three presses in one state", () => {
    expect.hasAssertions();

    const context = createKitTestContext(createCombatant(0));
    const behaviour = createXianyunKitBehaviour();
    behaviour.skill?.onStart?.(context);
    behaviour.skillChain?.[0]?.onStart?.(context);
    expect(countKitResource(context.kitEffectState.effects, XIANYUN_CHARACTER_ID, XIANYUN_SKYLADDER_STATE_ID)).toBe(2);
    behaviour.skillChain?.[1]?.onStart?.(context);
    expect(countKitResource(context.kitEffectState.effects, XIANYUN_CHARACTER_ID, XIANYUN_SKYLADDER_STATE_ID)).toBe(3);
  });

  test("a plunge in the state plays the leap for its press count, and spends the state on it", () => {
    expect.hasAssertions();

    const context = createKitTestContext(createCombatant(0));
    const behaviour = createXianyunKitBehaviour();
    behaviour.skill?.onStart?.(context);
    behaviour.skillChain?.[0]?.onStart?.(context);

    expect(behaviour.plungeVariants?.[0]?.checkIsActive(context)).toBe(false);
    expect(behaviour.plungeVariants?.[1]?.checkIsActive(context)).toBe(true);

    behaviour.plungeVariants?.[1]?.onStart?.(context);

    expect(countKitResource(context.kitEffectState.effects, XIANYUN_CHARACTER_ID, XIANYUN_SKYLADDER_STATE_ID)).toBe(0);
    expect(countKitResource(context.kitEffectState.effects, XIANYUN_CHARACTER_ID, XIANYUN_DRIFTCLOUD_ID)).toBe(2);
  });

  test("a Constellation 6 Burst gives eight presses that cost no cooldown, and a press spends one", () => {
    expect.hasAssertions();

    const context = createKitTestContext(createCombatant(6));
    const behaviour = createXianyunKitBehaviour();
    behaviour.burst?.onStart?.(context);

    expect(countKitResource(context.kitEffectState.effects, XIANYUN_CHARACTER_ID, XIANYUN_CONSTELLATION_6_ID)).toBe(8);

    behaviour.skill?.onStart?.(context);

    expect(countKitResource(context.kitEffectState.effects, XIANYUN_CHARACTER_ID, XIANYUN_CONSTELLATION_6_ID)).toBe(7);
    expect(
      findKitStatus(context.kitEffectState.effects, XIANYUN_CHARACTER_ID, XIANYUN_CONSTELLATION_6_ID)?.secondsRemaining,
    ).toBe(16);
  });

  test("a Constellation 6 press starts whatever its cooldown while its presses last", () => {
    expect.hasAssertions();

    const context = createKitTestContext(createCombatant(6));
    const behaviour = createXianyunKitBehaviour();
    expect(behaviour.isSkillCooldownWaived?.(context)).toBe(false);
    expect(behaviour.getSkillCooldownMultiplier?.(context)).toBe(1);

    behaviour.burst?.onStart?.(context);

    expect(behaviour.isSkillCooldownWaived?.(context)).toBe(true);
    expect(behaviour.getSkillCooldownMultiplier?.(context)).toBe(0);
  });

  test("a Constellation 6 Driftcloud Wave's hit gains CRIT DMG for its press count", () => {
    expect.hasAssertions();

    const combatant = createCombatant(6);
    const context = createKitTestContext(combatant);
    const behaviour = createXianyunKitBehaviour();
    behaviour.skill?.onStart?.(context);
    behaviour.skillChain?.[0]?.onStart?.(context);
    behaviour.plungeVariants?.[1]?.onStart?.(context);

    const strike = { attackTag: AttackTag.PlungingAttack, combatant } as KitStrike;
    expect(
      behaviour.getStrikeCriticalDamageBonus?.(strike, {} as never, {} as never, context.kitEffectState.effects),
    ).toBe(0.35);

    const elementalSkillStrike = { attackTag: AttackTag.ElementalSkill, combatant } as KitStrike;
    expect(
      behaviour.getStrikeCriticalDamageBonus?.(
        elementalSkillStrike,
        {} as never,
        {} as never,
        context.kitEffectState.effects,
      ),
    ).toBe(0);
  });

  test("a Constellation 4 Driftcloud Wave's hit heals Xianyun by half her ATK at one press, once in five seconds", () => {
    expect.hasAssertions();

    const combatant = {
      ...createCombatant(4),
      attributes: computeCharacterAttributes([
        { attribute: Attribute.BaseAttack, value: 1000 },
        { attribute: Attribute.BaseHealth, value: 10_000 },
      ]),
    };
    const context = createKitTestContext(combatant, {
      characterIdCombatantMap: new Map([[XIANYUN_CHARACTER_ID, combatant]]),
    });
    const behaviour = createXianyunKitBehaviour();
    behaviour.skill?.onStart?.(context);
    behaviour.plungeVariants?.[0]?.onStart?.(context);

    const member = context.party.characterIdMemberMap.get(XIANYUN_CHARACTER_ID);
    assert.exists(member);
    member.healthShare = 0.5;
    const strike = { attackTag: AttackTag.PlungingAttack, combatant } as KitStrike;
    behaviour.plungeVariants?.[0]?.hits?.[0]?.onStrike?.(context, strike, {} as never);

    expect(member.healthShare).toBeCloseTo(0.5 + (0.5 * 1000) / 10_000, 10);
    expect(
      checkIsKitStatusActive(context.kitEffectState.effects, XIANYUN_CHARACTER_ID, XIANYUN_CONSTELLATION_4_ICD_ID),
    ).toBe(true);

    member.healthShare = 0.5;
    behaviour.plungeVariants?.[0]?.hits?.[0]?.onStrike?.(context, strike, {} as never);

    expect(member.healthShare).toBe(0.5);
  });
});
