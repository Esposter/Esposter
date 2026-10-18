import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHealthChangedEvent } from "#src/models/kit/KitHealthChangedEvent";
import type { KitStance } from "#src/models/kit/KitStance";
import type { KitStatus } from "#src/models/kit/KitStatus";
import type { KitActionRecord } from "#src/models/kit/record/KitActionRecord";
import type { KitHitRecord } from "#src/models/kit/record/KitHitRecord";
import type { KitRecord } from "#src/models/kit/record/KitRecord";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { KitPlunge } from "#src/models/kit/record/KitPlunge";
import { KitTargeting } from "#src/models/kit/record/KitTargeting";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { buildKit } from "#src/services/kit/buildKit";
import { createWriothesleyKitBehaviour, WRIOTHESLEY_CHARACTER_ID } from "#src/services/kit/characters/wriothesleyKit";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { toKitSeconds } from "#src/services/kit/toKitSeconds";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { assert, describe, expect, test } from "vitest";

// A synthetic record of the shape Wriothesley's record takes, with no numbers of his, so these suites run before his
// Chilling Penalty stance is published
const HIT_RECORD: KitHitRecord = {
  area: { angle: 2 * Math.PI, height: 2, radius: 1 },
  hitmarkFrames: 12,
  multiplier: 1,
  poiseDamage: 0,
};
const createActionRecord = (hits: KitHitRecord[] = [HIT_RECORD]): KitActionRecord => ({
  animationFrames: 30,
  hits,
  targeting: KitTargeting.Strike,
});
const NORMAL_ATTACK_RECORDS = [
  createActionRecord(),
  createActionRecord(),
  createActionRecord(),
  createActionRecord([HIT_RECORD, HIT_RECORD]),
  createActionRecord(),
];
const RECORD: KitRecord = {
  burst: createActionRecord(),
  burstCooldownSeconds: 15,
  chargedAttack: createActionRecord(),
  chargedAttackStamina: 20,
  frames: { cast: 90 },
  hits: { explosion: HIT_RECORD },
  normalAttacks: NORMAL_ATTACK_RECORDS,
  plungeCollision: HIT_RECORD,
  plunges: { [KitPlunge.High]: createActionRecord(), [KitPlunge.Low]: createActionRecord() },
  skill: createActionRecord(),
  skillCooldownSeconds: 6,
  skillHolds: [],
  stances: { chillingPenalty: { normalAttacks: NORMAL_ATTACK_RECORDS } },
};
const WRIOTHESLEY_KIT = buildKit(RECORD, {}, {}, createWriothesleyKitBehaviour);
const ICEFANG_RUSH_ID = "wriothesley-icefang-rush";

const createWriothesleyCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: WRIOTHESLEY_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: WRIOTHESLEY_KIT,
  level: 90,
});

// The status of an id Wriothesley holds among the team's effects
const findWriothesleyStatus = (context: KitContext, id: string): KitStatus | undefined =>
  findKitStatus(context.kitEffectState.effects, WRIOTHESLEY_CHARACTER_ID, id);

// The stance Chilling Penalty holds among the team's effects, if it holds one
const findChillingPenalty = ({ kitEffectState: { effects } }: KitContext): KitStance | undefined =>
  effects.find((effect): effect is KitStance => effect.kind === "stance");

// His health share, which a drain or a heal moves
const readHealthShare = (context: KitContext): number =>
  getPartyMember(context.party, WRIOTHESLEY_CHARACTER_ID).healthShare;

// Lands the first hit of one of the normal attacks Chilling Penalty plays, as a strike of his own
const strikeChillingPenalty = (context: KitContext, index: number): void => {
  const stance = findChillingPenalty(context);
  const hit = stance?.combatant.kit.normalAttacks[index]?.hits[0];
  if (stance && hit?.onStrike) hit.onStrike(context, { body: context.body, combatant: stance.combatant, hit });
};

// A drain of his own HP by Chilling Penalty, as the party records it with him as its source
const createSelfDrain = (): KitHealthChangedEvent => ({
  characterId: WRIOTHESLEY_CHARACTER_ID,
  healthShare: -0.045,
  kind: KitEventKind.HealthChanged,
  overflowHealthShare: 0,
  sourceCharacterId: WRIOTHESLEY_CHARACTER_ID,
});

describe(createWriothesleyKitBehaviour, () => {
  test("icefang rush holds chilling penalty from its cast while his HP is above half", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createWriothesleyCombatant());
    WRIOTHESLEY_KIT.elementalSkill.onStart?.(context);
    expect(findChillingPenalty(context)?.characterId).toBe(WRIOTHESLEY_CHARACTER_ID);
    expect(findChillingPenalty(context)?.secondsRemaining).toBe(
      findWriothesleyStatus(context, ICEFANG_RUSH_ID)?.secondsRemaining,
    );
  });

  test("chilling penalty drops at half or less HP, and holds again once his HP is above half", () => {
    expect.hasAssertions();
    const combatant = createWriothesleyCombatant();
    const context = createKitTestContext(combatant);
    WRIOTHESLEY_KIT.elementalSkill.onStart?.(context);
    getPartyMember(context.party, WRIOTHESLEY_CHARACTER_ID).healthShare = 0.5;
    WRIOTHESLEY_KIT.onKitEvent?.(createSelfDrain(), context, combatant);
    expect(findChillingPenalty(context)).toBeUndefined();
    getPartyMember(context.party, WRIOTHESLEY_CHARACTER_ID).healthShare = 0.6;
    WRIOTHESLEY_KIT.onKitEvent?.(createSelfDrain(), context, combatant);
    expect(findChillingPenalty(context)).toBeDefined();
  });

  test("recasting icefang rush restarts chilling penalty with its full seconds", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createWriothesleyCombatant());
    WRIOTHESLEY_KIT.elementalSkill.onStart?.(context);
    const fullSeconds = findChillingPenalty(context)?.secondsRemaining;
    stepKitSeconds(context, 4);
    expect(findChillingPenalty(context)?.secondsRemaining).toBeLessThan(fullSeconds ?? 0);
    WRIOTHESLEY_KIT.elementalSkill.onStart?.(context);
    expect(findChillingPenalty(context)?.secondsRemaining).toBe(fullSeconds);
  });

  test("chilling penalty ends with icefang rush, after its ten seconds", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createWriothesleyCombatant());
    WRIOTHESLEY_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 11);
    expect(findWriothesleyStatus(context, ICEFANG_RUSH_ID)).toBeUndefined();
    expect(findChillingPenalty(context)).toBeUndefined();
  });

  test("an enhanced strike drains 4.5% of his Max HP as Chilling Penalty, once per 6 frames", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createWriothesleyCombatant());
    WRIOTHESLEY_KIT.elementalSkill.onStart?.(context);
    strikeChillingPenalty(context, 0);
    strikeChillingPenalty(context, 1);
    expect(readHealthShare(context)).toBeCloseTo(0.955);
    stepKitSeconds(context, toKitSeconds(5));
    strikeChillingPenalty(context, 2);
    expect(readHealthShare(context)).toBeCloseTo(0.955);
    stepKitSeconds(context, toKitSeconds(2));
    strikeChillingPenalty(context, 3);
    expect(readHealthShare(context)).toBeCloseTo(0.91);
  });

  test("an enhanced strike gives one Cryo particle every two seconds, collected 100 frames after it is given", () => {
    expect.hasAssertions();
    const combatant = createWriothesleyCombatant();
    const context = createKitTestContext(combatant);
    WRIOTHESLEY_KIT.elementalSkill.onStart?.(context);
    strikeChillingPenalty(context, 0);
    const particle = findWriothesleyStatus(context, "wriothesley-particle");
    expect(particle).toStrictEqual({
      characterId: WRIOTHESLEY_CHARACTER_ID,
      id: "wriothesley-particle",
      kind: "status",
      secondsRemaining: toKitSeconds(100),
      stacks: 1,
    });
    stepKitSeconds(context, 1);
    strikeChillingPenalty(context, 1);
    expect(findWriothesleyStatus(context, "wriothesley-particle")?.stacks).toBe(1);
    assert(particle);
    WRIOTHESLEY_KIT.onKitEvent?.({ effect: particle, kind: KitEventKind.EffectExpired }, context, combatant);
    expect(getPartyMember(context.party, WRIOTHESLEY_CHARACTER_ID).energy).toBe(1);
  });
});
