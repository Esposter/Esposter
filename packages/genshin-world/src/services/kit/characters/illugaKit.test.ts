import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import {
  createIllugaKitBehaviour,
  ILLUGA_CHARACTER_ID,
  LIGHTKEEPERS_OATH_STATUS_ID,
} from "#src/services/kit/characters/illugaKit";
import { HAUNTED_NIGHT_STATUS_ID, NIGHTINGALE_SONG_STATUS_ID } from "#src/services/kit/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const ILLUGA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, ILLUGA_CHARACTER_ID);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

const MAX_HEALTH = 10_000;

const createIllugaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
  characterId: ILLUGA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: ILLUGA_KIT,
  level: 90,
  weaponType: WeaponType.Polearm,
});

// A team of Illuga and the Traveler, with the burst's and skill's effects on the state, and the Traveler on the field
const createTeamContext = (illuga: Combatant) => {
  const traveler: Combatant = { ...illuga, characterId: TRAVELER_CHARACTER_ID, kit: TRAVELER_KIT };
  const context = createKitTestContext(illuga, {
    characterIdCombatantMap: new Map([
      [ILLUGA_CHARACTER_ID, illuga],
      [TRAVELER_CHARACTER_ID, traveler],
    ]),
    party: createParty([ILLUGA_CHARACTER_ID, TRAVELER_CHARACTER_ID]),
  });
  return { context, traveler };
};

// A combatant whose kit is a Moonsign benediction, the member a team's Ascendant Gleam counts
const withBenediction = (combatant: Combatant, constellationCount: number): Combatant => ({
  ...combatant,
  constellationCount,
  kit: { ...combatant.kit, moonsignBenediction: { getBaseDamageBonus: () => 0, lunarReactionTypes: [] } },
});

const createEnemyGeoHit = (striker: Combatant): KitEvent => ({
  element: Element.Geo,
  enemy: createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, id: "enemy", position: { x: 0, z: 0 } }, ""),
  kind: KitEventKind.EnemyHit,
  striker,
});

const findDefenseBuff = (context: KitContext, characterId: number) =>
  context.kitEffectState.effects.find(
    (effect): effect is KitBuff =>
      effect.kind === "buff" && effect.characterId === characterId && effect.attribute === Attribute.Defense,
  );

const priceStrike = (context: KitContext, illuga: Combatant, striker: Combatant, element: Element) =>
  ILLUGA_KIT.getPartyStrikeBonus?.(
    illuga,
    { body: context.body, combatant: striker, hit: { ...takeOne(ILLUGA_KIT.elementalBurst.hits), element } },
    createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
    context.party,
    context.kitEffectState.effects,
    context.characterIdCombatantMap,
  );

describe(createIllugaKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    expect([
      takeOne(takeOne(ILLUGA_KIT.normalAttacks).hits).talentMultiplier,
      takeOne(ILLUGA_KIT.chargedAttack.hits).talentMultiplier,
      ILLUGA_KIT.plungeCollision.talentMultiplier,
      takeOne(ILLUGA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(ILLUGA_KIT.highPlunge.hits).talentMultiplier,
    ]).toStrictEqual([0.473662, 1.11026, 0.639324, 1.278377, 1.596762]);
  });

  test("costs 60 energy for its burst, cooling for 15 seconds, and 25 stamina for its charged attack, its skill cooling for 15 seconds", () => {
    expect.hasAssertions();
    expect(ILLUGA_KIT.burstEnergyCost).toBe(60);
    expect(ILLUGA_KIT.burstCooldownSeconds).toBe(15);
    expect(ILLUGA_KIT.chargedAttackStamina).toBe(25);
    expect(ILLUGA_KIT.skillCooldownSeconds).toBe(15);
  });

  test("his burst gains Haunted Night's Oriole-Song for 20 seconds, with 21 stacks of Nightingale's Song", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createIllugaCombatant());

    ILLUGA_KIT.elementalBurst.onStart?.(context);

    expect(
      findKitStatus(context.kitEffectState.effects, ILLUGA_CHARACTER_ID, HAUNTED_NIGHT_STATUS_ID)?.secondsRemaining,
    ).toBe(20);
    expect(countKitResource(context.kitEffectState.effects, ILLUGA_CHARACTER_ID, NIGHTINGALE_SONG_STATUS_ID)).toBe(21);
  });

  test("a Geo hit a nearby active party member deals spends a Nightingale's Song stack, and Illuga's own hits and other elements do not", () => {
    expect.hasAssertions();
    const illuga = createIllugaCombatant();
    const traveler: Combatant = { ...illuga, characterId: TRAVELER_CHARACTER_ID, kit: TRAVELER_KIT };
    const enemy: Enemy = createEnemy(
      enemyTables,
      [],
      { ...ENEMY_CAMP_MEMBER, id: "enemy", position: { x: 0, z: 0 } },
      "",
    );
    const context = createKitTestContext(illuga, {
      characterIdCombatantMap: new Map([
        [ILLUGA_CHARACTER_ID, illuga],
        [TRAVELER_CHARACTER_ID, traveler],
      ]),
      enemyMap: new Map([[enemy.id, enemy]]),
      enemyTables,
      party: createParty([ILLUGA_CHARACTER_ID, TRAVELER_CHARACTER_ID]),
    });
    const createEnemyHit = (element: Element, striker: Combatant): KitEvent => ({
      element,
      enemy,
      kind: KitEventKind.EnemyHit,
      striker,
    });
    const stacks = () =>
      countKitResource(context.kitEffectState.effects, ILLUGA_CHARACTER_ID, NIGHTINGALE_SONG_STATUS_ID);

    ILLUGA_KIT.elementalBurst.onStart?.(context);
    context.activeCombatant = traveler;
    emitKitEvent(createEnemyHit(Element.Geo, traveler), context);
    expect(stacks()).toBe(20);
    emitKitEvent(createEnemyHit(Element.Pyro, traveler), context);
    expect(stacks()).toBe(20);
    context.activeCombatant = illuga;
    emitKitEvent(createEnemyHit(Element.Geo, illuga), context);
    expect(stacks()).toBe(20);
  });

  test("torchforger's Covenant gives each other deployed member Lightkeeper's Oath for 20 seconds from his burst, from ascension 1", () => {
    expect.hasAssertions();
    const illuga = { ...createIllugaCombatant(), ascension: 1 };
    const { context } = createTeamContext(illuga);

    ILLUGA_KIT.elementalBurst.onStart?.(context);

    expect(
      findKitStatus(context.kitEffectState.effects, TRAVELER_CHARACTER_ID, LIGHTKEEPERS_OATH_STATUS_ID)
        ?.secondsRemaining,
    ).toBe(20);
    expect(
      findKitStatus(context.kitEffectState.effects, ILLUGA_CHARACTER_ID, LIGHTKEEPERS_OATH_STATUS_ID),
    ).toBeUndefined();
  });

  test("lightkeeper's Oath gives a Geo hit its member deals 5% CRIT Rate and 10% CRIT DMG, and 10% and 30% at constellation 6", () => {
    expect.hasAssertions();
    const illuga = createIllugaCombatant();
    const { context, traveler } = createTeamContext(illuga);
    addKitStatus(context.kitEffectState, TRAVELER_CHARACTER_ID, {
      id: LIGHTKEEPERS_OATH_STATUS_ID,
      secondsRemaining: 20,
    });

    expect(priceStrike(context, illuga, traveler, Element.Geo)).toStrictEqual({
      criticalDamageBonus: 0.1,
      criticalRateBonus: 0.05,
    });
    expect(priceStrike(context, illuga, traveler, Element.Pyro)?.criticalRateBonus).toBeUndefined();
    expect(priceStrike(context, { ...illuga, constellationCount: 6 }, traveler, Element.Geo)).toStrictEqual({
      criticalDamageBonus: 0.3,
      criticalRateBonus: 0.1,
    });
  });

  test("solarhunting Wolf gives the active member 200 DEF while Haunted Night holds, from constellation 4", () => {
    expect.hasAssertions();
    const illuga = { ...createIllugaCombatant(), constellationCount: 4 };
    const { context, traveler } = createTeamContext(illuga);
    ILLUGA_KIT.elementalBurst.onStart?.(context);
    context.party = { ...context.party, activeIndex: 1 };
    context.activeCombatant = traveler;

    ILLUGA_KIT.onStep?.(context, illuga, 0.1);

    expect(findDefenseBuff(context, TRAVELER_CHARACTER_ID)?.amount).toBe(200);
  });

  test("solarhunting Wolf gives no DEF below constellation 4", () => {
    expect.hasAssertions();
    const illuga = { ...createIllugaCombatant(), constellationCount: 3 };
    const { context, traveler } = createTeamContext(illuga);
    ILLUGA_KIT.elementalBurst.onStart?.(context);
    context.party = { ...context.party, activeIndex: 1 };
    context.activeCombatant = traveler;

    ILLUGA_KIT.onStep?.(context, illuga, 0.1);

    expect(findDefenseBuff(context, TRAVELER_CHARACTER_ID)).toBeUndefined();
  });

  test("a Geo hit the active member deals adds 33.6% of Illuga's Elemental Mastery for the stack it spends, and Illuga's own hit adds none", () => {
    expect.hasAssertions();
    const illuga: Combatant = {
      ...createIllugaCombatant(),
      attributes: computeCharacterAttributes([{ attribute: Attribute.ElementalMastery, value: 1000 }]),
    };
    const { context, traveler } = createTeamContext(illuga);
    ILLUGA_KIT.elementalBurst.onStart?.(context);
    context.party = { ...context.party, activeIndex: 1 };

    expect(priceStrike(context, illuga, traveler, Element.Geo)?.additiveBaseDamageBonus).toBeCloseTo(336, 6);
    expect(priceStrike(context, illuga, illuga, Element.Geo)?.additiveBaseDamageBonus).toBeUndefined();
  });

  test("constellation 2 summons one Aedon hit for every 7 Nightingale's Song stacks consumed", () => {
    expect.hasAssertions();
    const illuga = { ...createIllugaCombatant(), constellationCount: 2 };
    const { context, traveler } = createTeamContext(illuga);
    ILLUGA_KIT.elementalBurst.onStart?.(context);
    context.activeCombatant = traveler;
    const summonCount = () => context.kitEffectState.effects.filter((effect) => effect.kind === "summon").length;

    for (let hit = 0; hit < 6; hit++) emitKitEvent(createEnemyGeoHit(traveler), context);
    expect(summonCount()).toBe(0);
    emitKitEvent(createEnemyGeoHit(traveler), context);
    expect(summonCount()).toBe(1);
  });

  test("lightkeeper's oath gives 50 Elemental Mastery under ascendant gleam, and 80 from constellation 6", () => {
    expect.hasAssertions();
    const illuga = createIllugaCombatant();
    const { context, traveler } = createTeamContext(illuga);
    addKitStatus(context.kitEffectState, TRAVELER_CHARACTER_ID, {
      id: LIGHTKEEPERS_OATH_STATUS_ID,
      secondsRemaining: 20,
    });
    const elementalMastery = () =>
      context.kitEffectState.effects.find(
        (effect): effect is KitBuff =>
          effect.kind === "buff" &&
          effect.characterId === TRAVELER_CHARACTER_ID &&
          effect.attribute === Attribute.ElementalMastery,
      );

    ILLUGA_KIT.onStep?.(context, illuga, 0.1);
    expect(elementalMastery()).toBeUndefined();

    context.characterIdCombatantMap.set(ILLUGA_CHARACTER_ID, withBenediction(illuga, 0));
    context.characterIdCombatantMap.set(TRAVELER_CHARACTER_ID, withBenediction(traveler, 0));
    ILLUGA_KIT.onStep?.(context, withBenediction(illuga, 0), 0.1);
    expect(elementalMastery()?.amount).toBe(50);

    context.kitEffectState.effects = context.kitEffectState.effects.filter((effect) => effect.kind !== "buff");
    ILLUGA_KIT.onStep?.(context, withBenediction(illuga, 6), 0.1);
    expect(elementalMastery()?.amount).toBe(80);
  });
});
