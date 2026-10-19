import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitField } from "#src/models/kit/KitField";
import type { KitSummon } from "#src/models/kit/KitSummon";
import type { GroundPoint } from "genshin-engine";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createGorouKitBehaviour, GOROU_CHARACTER_ID } from "#src/services/kit/characters/gorouKit";
import { createKitBody } from "#src/services/kit/createKitBody";
import { castKitAction, createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { getElementCriticalDamageBonus } from "#src/services/kit/effects/getElementCriticalDamageBonus";
import { stepKitField } from "#src/services/kit/effects/stepKitField";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const GOROU_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, GOROU_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createGorouCombatant = (characterId = GOROU_CHARACTER_ID): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId,
  constellationCount: 0,
  element: Element.Geo,
  elementalResonances: [],
  kit: GOROU_KIT,
  level: 90,
  weaponType: WeaponType.Bow,
});

const checkIsField = (effect: KitEffect): effect is KitField => effect.kind === "field";

// Gorou at the constellation, with the given combatants beside him on the team, the Geo ones counted for Crunch and Constellation 6
const createTeam = (constellationCount: number, others: Combatant[], gorou = createGorouCombatant()) => {
  const combatant = { ...gorou, constellationCount };
  const members = [combatant, ...others];
  const kitEffectState: KitEffectState = { effects: [] };
  const party = createParty(members.map(({ characterId }) => characterId));
  return {
    combatant,
    context: createKitTestContext(combatant, {
      characterIdCombatantMap: new Map(members.map((member) => [member.characterId, member] as const)),
      kitEffectState,
      party,
    }),
    kitEffectState,
    party,
  };
};

// The centre of the team's one field, the General's War Banner or Juuga's field
const readFieldCentre = (kitEffectState: KitEffectState): GroundPoint =>
  takeOne(kitEffectState.effects.filter(checkIsField)).centre;

// The team DEF buffs Juuga's cast gives as Gorou stands at the ascension
const getA1Buffs = (ascension: number): KitEffect[] =>
  castKitAction(GOROU_KIT.elementalBurst, { ...createGorouCombatant(), ascension }).effects.filter(
    (effect) => effect.kind === "buff" && effect.source === "gorou-a1",
  );

// Gorou with 1,000 DEF and the 10,000 base HP his combatant has, at the ascension
const createGorouWithDefense = (ascension: number): Combatant => ({
  ...createGorouCombatant(),
  ascension,
  attributes: computeCharacterAttributes([
    { attribute: Attribute.BaseHealth, value: 10_000 },
    { attribute: Attribute.Defense, value: 1000 },
  ]),
});

// The burst's hit, from which Constellation 4's heal chain starts its first 1.5 seconds
const readBurstHitmarkSeconds = (): number => takeOne(GOROU_KIT.elementalBurst.hits).hitmarkSeconds;
describe(createGorouKitBehaviour, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

  const OTHER_CHARACTER_ID = 10_000_052;
  const THIRD_CHARACTER_ID = 10_000_029;

  // A Geo hit from the striker on an enemy standing at the point
  const createHit = (striker: Combatant, point: GroundPoint, element = Element.Geo): KitEvent => ({
    element,
    enemy: { ...enemy, position: point },
    kind: KitEventKind.EnemyHit,
    striker,
  });

  // The skill cooldown Gorou has left after the hit the other member lands, with the banner standing
  const readCooldownAfterHit = (constellationCount: number, hit: (centre: GroundPoint) => KitEvent): number => {
    const { combatant, context, kitEffectState, party } = createTeam(constellationCount, [
      createGorouCombatant(OTHER_CHARACTER_ID),
    ]);
    GOROU_KIT.elementalSkill.onStart?.(context);
    getPartyMember(party, GOROU_CHARACTER_ID).skillCooldownSeconds = 10;
    GOROU_KIT.onKitEvent?.(hit(readFieldCentre(kitEffectState)), context, combatant);
    return getPartyMember(party, GOROU_CHARACTER_ID).skillCooldownSeconds;
  };

  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const crystalCollapse = castKitAction(GOROU_KIT.elementalBurst, createGorouCombatant()).effects.find(
      (effect): effect is KitSummon => effect.kind === "summon",
    );
    const multipliers = [
      ...GOROU_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(GOROU_KIT.chargedAttack.hits).talentMultiplier,
      GOROU_KIT.plungeCollision.talentMultiplier,
      takeOne(GOROU_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(GOROU_KIT.highPlunge.hits).talentMultiplier,
      takeOne(GOROU_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(GOROU_KIT.elementalBurst.hits).talentMultiplier,
      takeOne(crystalCollapse?.hits ?? []).talentMultiplier,
    ];

    expect(multipliers).toStrictEqual([
      0.37754, 0.37152, 0.4945, 0.58996, 1.24, 0.568288, 1.136335, 1.419344, 1.072, 0.98216, 0.613,
    ]);
  });

  test("the General's War Banner buffs the active character's DEF, and its Geo DMG from three Geo characters", () => {
    expect.hasAssertions();
    const banner = castKitAction(GOROU_KIT.elementalSkill, createGorouCombatant()).effects.find((effect) =>
      checkIsField(effect),
    );
    const combatant = createGorouCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    banner?.onTick(
      createKitTestContext(combatant, {
        characterIdCombatantMap: new Map([
          [1, createGorouCombatant(1)],
          [2, createGorouCombatant(2)],
          [GOROU_CHARACTER_ID, combatant],
        ]),
        kitEffectState,
      }),
      0,
    );

    expect(kitEffectState.effects).toStrictEqual([
      {
        amount: 206.16,
        attribute: Attribute.Defense,
        characterId: GOROU_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 2,
        source: "gorou-defense",
      },
      {
        amount: 0.15,
        attribute: Attribute.GeoDamageBonus,
        characterId: GOROU_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 2,
        source: "gorou-crunch",
      },
    ]);
  });

  test("juuga's field moves with the body on the field", () => {
    expect.hasAssertions();
    const field = castKitAction(GOROU_KIT.elementalBurst, createGorouCombatant()).effects.find((effect) =>
      checkIsField(effect),
    );
    if (field)
      stepKitField(field, 0, createKitTestContext(createGorouCombatant(), { body: createKitBody({ x: 3, z: -2 }) }));

    expect(field?.centre).toStrictEqual({ x: 3, z: -2 });
  });

  test("the General's War Banner is not placed while Juuga's field stands", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    castKitAction(GOROU_KIT.elementalBurst, createGorouCombatant(), kitEffectState);
    castKitAction(GOROU_KIT.elementalSkill, createGorouCombatant(), kitEffectState);

    expect(kitEffectState.effects.filter((effect) => checkIsField(effect))).toHaveLength(1);
  });

  test("the crystal collapse's five ticks are set out at the cast, the first at its task's 90 frames and its own 1 after the burst's hit", () => {
    expect.hasAssertions();
    const crystalCollapse = castKitAction(GOROU_KIT.elementalBurst, createGorouCombatant()).effects.find(
      (effect): effect is KitSummon => effect.kind === "summon",
    );

    expect(crystalCollapse?.isFollowing).toBe(true);
    expect(crystalCollapse?.hits).toHaveLength(5);
    expect(crystalCollapse?.hits[0]?.hitmarkSeconds).toBeCloseTo(122 / 60);
    expect(crystalCollapse?.hits[4]?.hitmarkSeconds).toBeCloseTo(482 / 60);
  });

  test("the Ascension 1 passive, Heedless of the Wind and Weather, takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(getA1Buffs(1)).toStrictEqual([
      {
        amount: 0.25,
        attribute: Attribute.DefensePercent,
        characterId: GOROU_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 12,
        source: "gorou-a1",
      },
    ]);
  });

  test("the Ascension 1 passive, Heedless of the Wind and Weather, does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(getA1Buffs(0)).toStrictEqual([]);
  });

  test("the Ascension 4 passive, A Favor Repaid, takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(takeOne(GOROU_KIT.elementalSkill.hits).additiveBaseDamageBonus?.(createGorouWithDefense(4))).toBe(1560);
  });

  test("the Ascension 4 passive, A Favor Repaid, does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(takeOne(GOROU_KIT.elementalSkill.hits).additiveBaseDamageBonus?.(createGorouWithDefense(3))).toBe(0);
  });

  test("constellation 6 gives every party member 40% CRIT DMG on Geo for 12 seconds after the skill, with three Geo characters on the team", () => {
    expect.hasAssertions();
    const { context, party } = createTeam(6, [
      createGorouCombatant(OTHER_CHARACTER_ID),
      createGorouCombatant(THIRD_CHARACTER_ID),
    ]);
    GOROU_KIT.elementalSkill.onStart?.(context);
    const memberIds = [...party.characterIdMemberMap.keys()];
    const readGeoCriticalDamage = (): number[] =>
      memberIds.map((characterId) =>
        getElementCriticalDamageBonus(context.kitEffectState.effects, characterId, Element.Geo),
      );

    expect(readGeoCriticalDamage()).toStrictEqual([0.4, 0.4, 0.4]);
    stepKitTestEffects(12, context);
    expect(readGeoCriticalDamage()).toStrictEqual([0, 0, 0]);
  });

  test("constellation 6's CRIT DMG is 10% with one Geo character on the team and 20% with two", () => {
    expect.hasAssertions();
    const alone = createTeam(6, []);
    GOROU_KIT.elementalSkill.onStart?.(alone.context);
    const pair = createTeam(6, [createGorouCombatant(OTHER_CHARACTER_ID)]);
    GOROU_KIT.elementalSkill.onStart?.(pair.context);

    expect({
      alone: getElementCriticalDamageBonus(alone.kitEffectState.effects, GOROU_CHARACTER_ID, Element.Geo),
      pair: getElementCriticalDamageBonus(pair.kitEffectState.effects, GOROU_CHARACTER_ID, Element.Geo),
    }).toStrictEqual({ alone: 0.1, pair: 0.2 });
  });

  test("constellation 6's CRIT DMG from the burst refreshes the skill's rather than stacking on it", () => {
    expect.hasAssertions();
    const { context, kitEffectState } = createTeam(6, [
      createGorouCombatant(OTHER_CHARACTER_ID),
      createGorouCombatant(THIRD_CHARACTER_ID),
    ]);
    GOROU_KIT.elementalSkill.onStart?.(context);
    GOROU_KIT.elementalBurst.onStart?.(context);

    expect(getElementCriticalDamageBonus(kitEffectState.effects, GOROU_CHARACTER_ID, Element.Geo)).toBe(0.4);
  });

  test("constellation 6's CRIT DMG is not given below Constellation 6", () => {
    expect.hasAssertions();
    const { context, kitEffectState } = createTeam(5, [
      createGorouCombatant(OTHER_CHARACTER_ID),
      createGorouCombatant(THIRD_CHARACTER_ID),
    ]);
    GOROU_KIT.elementalSkill.onStart?.(context);

    expect(getElementCriticalDamageBonus(kitEffectState.effects, GOROU_CHARACTER_ID, Element.Geo)).toBe(0);
  });

  test("constellation 1 cuts Inuzaka All-Round Defense's cooldown by 2 seconds for a nearby character's Geo hit in the banner", () => {
    expect.hasAssertions();

    expect(readCooldownAfterHit(1, (centre) => createHit(createGorouCombatant(OTHER_CHARACTER_ID), centre))).toBe(8);
  });

  test("constellation 1 cuts nothing for a hit that is not Geo, is Gorou's own, lands outside the banner, or is below Constellation 1", () => {
    expect.hasAssertions();

    expect([
      readCooldownAfterHit(1, (centre) => createHit(createGorouCombatant(OTHER_CHARACTER_ID), centre, Element.Hydro)),
      readCooldownAfterHit(1, (centre) => createHit(createGorouCombatant(), centre)),
      readCooldownAfterHit(1, () => createHit(createGorouCombatant(OTHER_CHARACTER_ID), { x: 20, z: 0 })),
      readCooldownAfterHit(0, (centre) => createHit(createGorouCombatant(OTHER_CHARACTER_ID), centre)),
    ]).toStrictEqual([10, 10, 10, 10]);
  });

  test("constellation 1's cut comes once every 10 seconds", () => {
    expect.hasAssertions();
    const { combatant, context, kitEffectState, party } = createTeam(1, [createGorouCombatant(OTHER_CHARACTER_ID)]);
    GOROU_KIT.elementalSkill.onStart?.(context);
    const gorou = getPartyMember(party, GOROU_CHARACTER_ID);
    gorou.skillCooldownSeconds = 10;
    const hit = createHit(createGorouCombatant(OTHER_CHARACTER_ID), readFieldCentre(kitEffectState));
    GOROU_KIT.onKitEvent?.(hit, context, combatant);
    GOROU_KIT.onKitEvent?.(hit, context, combatant);
    const afterSecondHit = gorou.skillCooldownSeconds;
    stepKitTestEffects(10, context);
    GOROU_KIT.onKitEvent?.(hit, context, combatant);

    expect({ afterSecondHit, afterTenSeconds: gorou.skillCooldownSeconds }).toStrictEqual({
      afterSecondHit: 8,
      afterTenSeconds: 6,
    });
  });

  test("constellation 1 counts Juuga's field, which covers eight metres round Gorou", () => {
    expect.hasAssertions();
    const { combatant, context, kitEffectState, party } = createTeam(1, [createGorouCombatant(OTHER_CHARACTER_ID)]);
    GOROU_KIT.elementalBurst.onStart?.(context);
    getPartyMember(party, GOROU_CHARACTER_ID).skillCooldownSeconds = 10;
    GOROU_KIT.onKitEvent?.(
      createHit(createGorouCombatant(OTHER_CHARACTER_ID), readFieldCentre(kitEffectState)),
      context,
      combatant,
    );

    expect(getPartyMember(party, GOROU_CHARACTER_ID).skillCooldownSeconds).toBe(8);
  });

  test("constellation 4 heals the active character by half Gorou's DEF every 1.5 seconds from the burst's hit, with two Geo characters on the team", () => {
    expect.hasAssertions();
    const { context, party } = createTeam(4, [createGorouCombatant(OTHER_CHARACTER_ID)], createGorouWithDefense(0));
    GOROU_KIT.elementalBurst.onStart?.(context);
    const member = getPartyMember(party, GOROU_CHARACTER_ID);
    member.healthShare = 0.5;

    stepKitTestEffects(readBurstHitmarkSeconds() + 1.5, context);
    expect(member.healthShare).toBeCloseTo(0.5 + (0.5 * 1000) / 10_000, 10);
  });

  test("constellation 4's heal stops once General's Glory ends", () => {
    expect.hasAssertions();
    const { context, party } = createTeam(4, [createGorouCombatant(OTHER_CHARACTER_ID)], createGorouWithDefense(0));
    GOROU_KIT.elementalBurst.onStart?.(context);
    const member = getPartyMember(party, GOROU_CHARACTER_ID);
    member.healthShare = 0.5;

    stepKitTestEffects(12, context);
    const healthShareAtGloryEnd = member.healthShare;
    expect(healthShareAtGloryEnd).toBeGreaterThan(0.5);
    stepKitTestEffects(30, context);
    expect(member.healthShare).toBe(healthShareAtGloryEnd);
  });

  test("constellation 4 heals nothing with one Geo character on the team, the burst's heal waiting on two", () => {
    expect.hasAssertions();
    const { context, party } = createTeam(4, [], createGorouWithDefense(0));
    GOROU_KIT.elementalBurst.onStart?.(context);
    const member = getPartyMember(party, GOROU_CHARACTER_ID);
    member.healthShare = 0.5;

    stepKitTestEffects(readBurstHitmarkSeconds() + 1.5, context);
    expect(member.healthShare).toBe(0.5);
  });

  test("constellation 4's heal is not given below Constellation 4", () => {
    expect.hasAssertions();
    const { context, party } = createTeam(3, [createGorouCombatant(OTHER_CHARACTER_ID)], createGorouWithDefense(0));
    GOROU_KIT.elementalBurst.onStart?.(context);
    const member = getPartyMember(party, GOROU_CHARACTER_ID);
    member.healthShare = 0.5;

    stepKitTestEffects(readBurstHitmarkSeconds() + 1.5, context);
    expect(member.healthShare).toBe(0.5);
  });

  test("a new burst replaces the heal standing, so one heal comes every 1.5 seconds rather than two", () => {
    expect.hasAssertions();
    const { context, party } = createTeam(4, [createGorouCombatant(OTHER_CHARACTER_ID)], createGorouWithDefense(0));
    GOROU_KIT.elementalBurst.onStart?.(context);
    GOROU_KIT.elementalBurst.onStart?.(context);
    const member = getPartyMember(party, GOROU_CHARACTER_ID);
    member.healthShare = 0.5;

    stepKitTestEffects(readBurstHitmarkSeconds() + 1.5, context);
    expect(member.healthShare).toBeCloseTo(0.5 + (0.5 * 1000) / 10_000, 10);
  });
});
