import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitEnemyHitEvent } from "#src/models/kit/KitEnemyHitEvent";
import type { KitField } from "#src/models/kit/KitField";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import {
  createShenheKitBehaviour,
  ICY_QUILL_STATUS_ID,
  SHENHE_CHARACTER_ID,
  SKYFROST_MANTRA_STATUS_ID,
} from "#src/services/kit/characters/shenheKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const SHENHE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, SHENHE_CHARACTER_ID);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createShenheCombatant = (ascension = 0): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: SHENHE_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: SHENHE_KIT,
  level: 90,
  weaponType: WeaponType.Polearm,
});

const castField = (ascension: number, constellationCount = 0): KitField => {
  const kitEffectState: KitEffectState = { effects: [] };
  SHENHE_KIT.elementalBurst.onStart?.(
    createKitTestContext({ ...createShenheCombatant(ascension), constellationCount }, { kitEffectState }),
  );
  return takeOne(kitEffectState.effects.filter((effect): effect is KitField => effect.kind === "field"));
};
// The effects a field's tick adds, from a field cast by a combatant of the given ascension
const tickField = (ascension: number, tickIndex: number): KitEffect[] => {
  const kitEffectState: KitEffectState = { effects: [] };
  castField(ascension).onTick(createKitTestContext(createShenheCombatant(), { kitEffectState }), tickIndex);
  return kitEffectState.effects;
};

const tickSummon = (tickIndex: number): KitSummon | undefined =>
  tickField(0, tickIndex).find((effect): effect is KitSummon => effect.kind === "summon");

// Shenhe with a base ATK of 1000, which her Icy Quill's DMG bonus reads at its ratio
const createShenheWithAttack = (): Combatant => ({
  ...createShenheCombatant(),
  attributes: computeCharacterAttributes([
    { attribute: Attribute.BaseHealth, value: 10_000 },
    { attribute: Attribute.BaseAttack, value: 1000 },
  ]),
});
// A party member other than Shenhe, who carries whatever Icy Quill she gives it
const createMemberCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 90,
  weaponType: WeaponType.Polearm,
});
const createQuillContext = (kitEffectState: KitEffectState, shenhe: Combatant, member: Combatant): KitContext =>
  createKitTestContext(shenhe, {
    characterIdCombatantMap: new Map([
      [member.characterId, member],
      [shenhe.characterId, shenhe],
    ]),
    kitEffectState,
    party: createParty([shenhe.characterId, member.characterId]),
  });
// The party strike bonus Shenhe's kit gives a hit of the given element that the striker lands on an enemy
const priceStrike = (
  context: KitContext,
  shenhe: Combatant,
  striker: Combatant,
  element: Element,
  { attackTag }: { attackTag?: AttackTag } = { attackTag: AttackTag.ElementalSkill },
) =>
  SHENHE_KIT.getPartyStrikeBonus?.(
    shenhe,
    { attackTag, body: context.body, combatant: striker, hit: { ...takeOne(SHENHE_KIT.elementalSkill.hits), element } },
    createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
    context.party,
    context.kitEffectState.effects,
    context.characterIdCombatantMap,
  );

describe(createShenheKitBehaviour, () => {
  test("reads each talent multiplier from her proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...SHENHE_KIT.normalAttacks.flatMap((action) => action.hits.map((hit) => hit.talentMultiplier)),
      takeOne(SHENHE_KIT.chargedAttack.hits).talentMultiplier,
      SHENHE_KIT.plungeCollision.talentMultiplier,
      takeOne(SHENHE_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(SHENHE_KIT.highPlunge.hits).talentMultiplier,
      takeOne(SHENHE_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(SHENHE_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.43258, 0.40248, 0.5332, 0.26316, 0.26316, 0.65618, 1.106734, 0.639324, 1.278377, 1.596762, 1.392, 1.008,
    ];
    expect(multipliers).toStrictEqual(expectedMultipliers);
  });

  test("the press lands at 4 frames and the hold at 33, each holding its own cooldown", () => {
    expect.hasAssertions();
    const hold = takeOne(SHENHE_KIT.elementalSkillHolds ?? []);

    expect(Math.round(takeOne(SHENHE_KIT.elementalSkill.hits).hitmarkSeconds * 60)).toBe(4);
    expect(Math.round(takeOne(hold.action.hits).hitmarkSeconds * 60)).toBe(33);
    expect([SHENHE_KIT.skillCooldownSeconds, hold.cooldownSeconds]).toStrictEqual([10, 15]);
  });

  test("the charged attack costs her table's 25 stamina, and the burst her table's 80 energy", () => {
    expect.hasAssertions();
    expect([
      SHENHE_KIT.chargedAttackStamina,
      SHENHE_KIT.burstEnergyCost,
      SHENHE_KIT.burstCooldownSeconds,
    ]).toStrictEqual([25, 80, 20]);
  });

  test("divine Maiden's Deliverance's field ticks from 82 frames, every 117, and its DoT's second hit follows its tick's offset", () => {
    expect.hasAssertions();
    const field = castField(0);

    expect(field.nextTickSeconds).toBeCloseTo(82 / 60);
    expect(field.tickIntervalSeconds).toBeCloseTo(117 / 60);
    expect(field.radius).toBe(7);
    expect(tickSummon(1)?.hits.map((hit) => Math.round(hit.hitmarkSeconds * 60))).toStrictEqual([0, 32]);
  });

  test("a Constellation 2 burst's field lasts six seconds longer than a Constellation 0 burst's", () => {
    expect.hasAssertions();

    expect(castField(0, 2).secondsRemaining - castField(0).secondsRemaining).toBeCloseTo(6);
  });

  test("a Constellation 2 field gives the active character 15% CRIT DMG on its Cryo attacks for a tick", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    castField(0, 2).onTick(
      createKitTestContext({ ...createShenheCombatant(), constellationCount: 2 }, { kitEffectState }),
      0,
    );

    expect(kitEffectState.effects.filter((effect) => effect.kind === "elementCriticalDamage")).toStrictEqual([
      {
        amount: 0.15,
        characterId: SHENHE_CHARACTER_ID,
        element: Element.Cryo,
        kind: "elementCriticalDamage",
        secondsRemaining: 117 / 60,
        source: "shenhe-burst-constellation-2",
      },
    ]);
  });

  test("a Constellation 2 field's ticks restart the active character's CRIT DMG rather than stacking it", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    const field = castField(0, 2);
    const combatant = { ...createShenheCombatant(), constellationCount: 2 };
    field.onTick(createKitTestContext(combatant, { kitEffectState }), 0);
    field.onTick(createKitTestContext(combatant, { kitEffectState }), 1);

    expect(kitEffectState.effects.filter((effect) => effect.kind === "elementCriticalDamage")).toHaveLength(1);
  });

  test("a Constellation 0 field gives no CRIT DMG", () => {
    expect.hasAssertions();
    expect(tickField(0, 0).filter((effect) => effect.kind === "elementCriticalDamage")).toStrictEqual([]);
  });

  test("the field's Cryo DMG Bonus comes from Ascension 1, for the active character", () => {
    expect.hasAssertions();
    expect(tickField(0, 0).filter((effect) => effect.kind === "buff")).toStrictEqual([]);
    expect(tickField(1, 0).filter((effect) => effect.kind === "buff")).toStrictEqual([
      {
        amount: 0.15,
        attribute: Attribute.CryoDamageBonus,
        characterId: SHENHE_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 117 / 60,
        source: "shenhe-burst-cryo",
      },
    ]);
  });

  test("a Constellation 1 switch adds one Spring Spirit Summoning charge", () => {
    expect.hasAssertions();

    expect(SHENHE_KIT.getSkillChargeBonus?.({ ...createShenheCombatant(), constellationCount: 1 })).toBe(1);
  });

  test("a Constellation 0 switch adds no Spring Spirit Summoning charge", () => {
    expect.hasAssertions();

    expect(SHENHE_KIT.getSkillChargeBonus?.({ ...createShenheCombatant(), constellationCount: 0 })).toBe(0);
  });

  test("her Spring Spirit Summoning grants each other party member an Icy Quill for ten seconds and five triggers", () => {
    expect.hasAssertions();
    const shenhe = createShenheWithAttack();
    const member = createMemberCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    SHENHE_KIT.elementalSkill.onStart?.(createQuillContext(kitEffectState, shenhe, member));

    const quill = findKitStatus(kitEffectState.effects, member.characterId, ICY_QUILL_STATUS_ID);
    expect({ secondsRemaining: quill?.secondsRemaining, stacks: quill?.stacks }).toStrictEqual({
      secondsRemaining: 10,
      stacks: 5,
    });
    expect(findKitStatus(kitEffectState.effects, shenhe.characterId, ICY_QUILL_STATUS_ID)).toBeUndefined();
  });

  test("her held Spring Spirit Summoning grants the Icy Quill for fifteen seconds and seven triggers", () => {
    expect.hasAssertions();
    const shenhe = createShenheWithAttack();
    const member = createMemberCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    const [hold] = SHENHE_KIT.elementalSkillHolds ?? [];
    hold?.action.onStart?.(createQuillContext(kitEffectState, shenhe, member));

    const quill = findKitStatus(kitEffectState.effects, member.characterId, ICY_QUILL_STATUS_ID);
    expect({ secondsRemaining: quill?.secondsRemaining, stacks: quill?.stacks }).toStrictEqual({
      secondsRemaining: 15,
      stacks: 7,
    });
  });

  test("a Cryo hit a quilled member strikes adds Shenhe's ATK times the Icy Quill's ratio, at her start level", () => {
    expect.hasAssertions();
    const shenhe = createShenheWithAttack();
    const member = createMemberCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    addKitStatus(kitEffectState, member.characterId, { id: ICY_QUILL_STATUS_ID, secondsRemaining: 10, stacks: 5 });

    expect(
      priceStrike(createQuillContext(kitEffectState, shenhe, member), shenhe, member, Element.Cryo)
        ?.additiveBaseDamageBonus,
    ).toBeCloseTo(1000 * 0.45656, 6);
  });

  test("the Icy Quill's bonus reads Shenhe's current ATK, buffs included", () => {
    expect.hasAssertions();
    const shenhe = createShenheWithAttack();
    const member = createMemberCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    addKitStatus(kitEffectState, member.characterId, { id: ICY_QUILL_STATUS_ID, secondsRemaining: 10, stacks: 5 });
    buffKitMember(kitEffectState, shenhe.characterId, {
      amount: 0.5,
      attribute: Attribute.AttackPercent,
      secondsRemaining: 10,
      source: "shenhe-test-attack",
    });

    expect(
      priceStrike(createQuillContext(kitEffectState, shenhe, member), shenhe, member, Element.Cryo)
        ?.additiveBaseDamageBonus,
    ).toBeCloseTo(1500 * 0.45656, 6);
  });

  test("a non-Cryo hit a quilled member strikes adds no Icy Quill bonus", () => {
    expect.hasAssertions();
    const shenhe = createShenheWithAttack();
    const member = createMemberCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    addKitStatus(kitEffectState, member.characterId, { id: ICY_QUILL_STATUS_ID, secondsRemaining: 10, stacks: 5 });

    expect(
      priceStrike(createQuillContext(kitEffectState, shenhe, member), shenhe, member, Element.Hydro),
    ).toStrictEqual({});
  });

  test("a Cryo hit a member without an Icy Quill strikes adds no Icy Quill bonus", () => {
    expect.hasAssertions();
    const shenhe = createShenheWithAttack();
    const member = createMemberCombatant();
    const kitEffectState: KitEffectState = { effects: [] };

    expect(priceStrike(createQuillContext(kitEffectState, shenhe, member), shenhe, member, Element.Cryo)).toStrictEqual(
      {},
    );
  });

  test("each Cryo hit a quilled member strikes spends one of its triggers, and the last ends its Icy Quill", () => {
    expect.hasAssertions();
    const shenhe = createShenheWithAttack();
    const member = createMemberCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    addKitStatus(kitEffectState, member.characterId, { id: ICY_QUILL_STATUS_ID, secondsRemaining: 10, stacks: 2 });
    const context = createQuillContext(kitEffectState, shenhe, member);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const hit = (element: Element): KitEnemyHitEvent => ({
      attackTag: AttackTag.ElementalSkill,
      element,
      enemy,
      kind: KitEventKind.EnemyHit,
      striker: member,
    });

    emitKitEvent(hit(Element.Hydro), context);
    expect(findKitStatus(kitEffectState.effects, member.characterId, ICY_QUILL_STATUS_ID)?.stacks).toBe(2);
    emitKitEvent(hit(Element.Cryo), context);
    expect(findKitStatus(kitEffectState.effects, member.characterId, ICY_QUILL_STATUS_ID)?.stacks).toBe(1);
    emitKitEvent(hit(Element.Cryo), context);
    expect(findKitStatus(kitEffectState.effects, member.characterId, ICY_QUILL_STATUS_ID)).toBeUndefined();
  });

  test("a Cryo hit a quilled member strikes from an attack kind adds the Icy Quill's bonus, whichever kind it is", () => {
    expect.hasAssertions();
    const shenhe = createShenheWithAttack();
    const member = createMemberCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    addKitStatus(kitEffectState, member.characterId, { id: ICY_QUILL_STATUS_ID, secondsRemaining: 10, stacks: 5 });
    const context = createQuillContext(kitEffectState, shenhe, member);

    for (const attackTag of Object.values(AttackTag))
      expect(priceStrike(context, shenhe, member, Element.Cryo, { attackTag })?.additiveBaseDamageBonus).toBeCloseTo(
        1000 * 0.45656,
        6,
      );
  });

  test("a Cryo hit a quilled member strikes from no attack kind adds no Icy Quill bonus and spends no trigger", () => {
    expect.hasAssertions();
    const shenhe = createShenheWithAttack();
    const member = createMemberCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    addKitStatus(kitEffectState, member.characterId, { id: ICY_QUILL_STATUS_ID, secondsRemaining: 10, stacks: 5 });
    const context = createQuillContext(kitEffectState, shenhe, member);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

    expect(priceStrike(context, shenhe, member, Element.Cryo, {})?.additiveBaseDamageBonus).toBeUndefined();
    emitKitEvent({ element: Element.Cryo, enemy, kind: KitEventKind.EnemyHit, striker: member }, context);
    expect(findKitStatus(kitEffectState.effects, member.characterId, ICY_QUILL_STATUS_ID)?.stacks).toBe(5);
  });

  test("at Constellation 6 a normal or charged attack's trigger does not spend the quota, while a skill's does", () => {
    expect.hasAssertions();
    const shenhe = { ...createShenheWithAttack(), constellationCount: 6 };
    const member = createMemberCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    addKitStatus(kitEffectState, member.characterId, { id: ICY_QUILL_STATUS_ID, secondsRemaining: 10, stacks: 5 });
    const context = createQuillContext(kitEffectState, shenhe, member);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const hit = (attackTag: AttackTag): KitEnemyHitEvent => ({
      attackTag,
      element: Element.Cryo,
      enemy,
      kind: KitEventKind.EnemyHit,
      striker: member,
    });
    const stacks = () => findKitStatus(kitEffectState.effects, member.characterId, ICY_QUILL_STATUS_ID)?.stacks;

    emitKitEvent(hit(AttackTag.NormalAttack), context);
    emitKitEvent(hit(AttackTag.ChargedAttack), context);
    expect(stacks()).toBe(5);

    emitKitEvent(hit(AttackTag.ElementalSkill), context);
    expect(stacks()).toBe(4);
  });

  test("at Constellation 4 each trigger gives Shenhe a Skyfrost Mantra stack, up to fifty, and none below it", () => {
    expect.hasAssertions();
    const member = createMemberCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    addKitStatus(kitEffectState, member.characterId, { id: ICY_QUILL_STATUS_ID, secondsRemaining: 10, stacks: 5 });
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const hit = {
      attackTag: AttackTag.ElementalSkill,
      element: Element.Cryo,
      enemy,
      kind: KitEventKind.EnemyHit,
      striker: member,
    } as const;
    const mantra = () =>
      findKitStatus(kitEffectState.effects, SHENHE_CHARACTER_ID, SKYFROST_MANTRA_STATUS_ID)?.stacks ?? 0;

    const constellationThree = { ...createShenheWithAttack(), constellationCount: 3 };
    emitKitEvent(hit, createQuillContext(kitEffectState, constellationThree, member));
    expect(mantra()).toBe(0);

    const shenhe = { ...createShenheWithAttack(), constellationCount: 4 };
    addKitStatus(kitEffectState, shenhe.characterId, {
      id: SKYFROST_MANTRA_STATUS_ID,
      secondsRemaining: 60,
      stacks: 50,
    });
    addKitStatus(kitEffectState, member.characterId, { id: ICY_QUILL_STATUS_ID, secondsRemaining: 10, stacks: 5 });
    emitKitEvent(hit, createQuillContext(kitEffectState, shenhe, member));
    expect(mantra()).toBe(50);

    removeKitEffects(kitEffectState, (effect) => effect.kind === "status" && effect.id === SKYFROST_MANTRA_STATUS_ID);
    emitKitEvent(hit, createQuillContext(kitEffectState, shenhe, member));
    expect(mantra()).toBe(1);
  });

  test("her Spring Spirit Summoning consumes the Skyfrost Mantra stacks, each adding 5% DMG to her skill's hits", () => {
    expect.hasAssertions();
    const shenhe = { ...createShenheWithAttack(), constellationCount: 4 };
    const member = createMemberCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    addKitStatus(kitEffectState, shenhe.characterId, {
      id: SKYFROST_MANTRA_STATUS_ID,
      secondsRemaining: 60,
      stacks: 3,
    });
    const context = createQuillContext(kitEffectState, shenhe, member);
    const skillStrike = {
      attackTag: AttackTag.ElementalSkill,
      body: context.body,
      combatant: shenhe,
      hit: takeOne(SHENHE_KIT.elementalSkill.hits),
    };
    const damageBonus = () =>
      SHENHE_KIT.getStrikeDamageBonus?.(
        skillStrike,
        createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
        context.party,
        kitEffectState.effects,
      );

    expect(damageBonus()).toBe(0);

    SHENHE_KIT.elementalSkill.onStart?.(context);

    expect(findKitStatus(kitEffectState.effects, shenhe.characterId, SKYFROST_MANTRA_STATUS_ID)).toBeUndefined();
    expect(damageBonus()).toBeCloseTo(0.15, 6);
  });
});
