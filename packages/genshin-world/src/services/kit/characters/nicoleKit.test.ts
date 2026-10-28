import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEnemyHitEvent } from "#src/models/kit/KitEnemyHitEvent";
import type { KitShield } from "#src/models/kit/KitShield";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { Mock } from "vitest";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createNicoleKitBehaviour, NICOLE_CHARACTER_ID } from "#src/services/kit/characters/nicoleKit";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test, vi } from "vitest";

const NICOLE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, NICOLE_CHARACTER_ID);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

const createNicoleCombatant = (attack: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.Attack, value: attack }]),
  characterId: NICOLE_CHARACTER_ID,
  constellationCount: 0,
  element: Element.Pyro,
  elementalResonances: [],
  kit: NICOLE_KIT,
  level: 90,
});

// A team of Nicole and the Traveler on one enemy at the body's origin, with the Traveler's kit hearing what the team's
// Events report, so each projection's damage shows in its count
const createProjectionScene = (onKitEvent: Kit["onKitEvent"], nicoleFields: Partial<Combatant> = {}) => {
  const nicole = { ...createNicoleCombatant(1000), ...nicoleFields };
  const traveler: Combatant = {
    ...nicole,
    ascension: 0,
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    element: Element.Hydro,
    kit: { ...TRAVELER_KIT, onKitEvent },
  };
  // A test enemy that outlives its projections, so each one finds it standing
  const enemy = {
    ...createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, id: "enemy", position: { x: 0, z: 0 } }, ""),
    health: 1_000_000,
  };
  const context = createKitTestContext(nicole, {
    characterIdCombatantMap: new Map([
      [NICOLE_CHARACTER_ID, nicole],
      [TRAVELER_CHARACTER_ID, traveler],
    ]),
    enemyMap: new Map([[enemy.id, enemy]]),
    enemyTables,
    party: createParty([NICOLE_CHARACTER_ID, TRAVELER_CHARACTER_ID]),
  });
  return { context, enemy, nicole, traveler };
};

const createEnemyHit = (enemy: Enemy, striker: Combatant, attackTag?: AttackTag): KitEnemyHitEvent => ({
  attackTag,
  element: Element.Pyro,
  enemy,
  kind: KitEventKind.EnemyHit,
  striker,
});

// The talent multipliers of the hits a team's kit heard land, one for each damage its enemy takes
const getDamageTakenMultipliers = (onKitEvent: Mock<NonNullable<Kit["onKitEvent"]>>): number[] =>
  onKitEvent.mock.calls.flatMap(([event]) =>
    event.kind === KitEventKind.DamageTaken ? [event.hit.talentMultiplier] : [],
  );

// The projections a team's kit heard land, each reported as the damage its enemy takes
const countDamageTaken = (onKitEvent: Mock<NonNullable<Kit["onKitEvent"]>>): number =>
  getDamageTakenMultipliers(onKitEvent).length;

// The buffs a character holds among the kit's effects, in the order they were given
const getBuffs = (context: KitContext, characterId: number): KitBuff[] =>
  context.kitEffectState.effects.filter(
    (effect): effect is KitBuff => effect.kind === "buff" && effect.characterId === characterId,
  );

const emitSwap = (context: KitContext, characterId: number, previousCharacterId: number): void => {
  emitKitEvent({ characterId, kind: KitEventKind.CharacterSwapped, previousCharacterId }, context);
};

// The enemy hits a striker lands on an enemy, one after another, each reported to the team's kits
const emitEnemyHits = (
  context: KitContext,
  enemy: Enemy,
  striker: Combatant,
  attackTag: AttackTag | undefined,
  count: number,
): void => {
  for (let hit = 0; hit < count; hit += 1) emitKitEvent(createEnemyHit(enemy, striker, attackTag), context);
};

// A field of the strike bonus Nicole's kit gives a strike of a deployed member, zero when it gives none
const getPartyStrikeBonus = (
  field: keyof ReturnType<NonNullable<Kit["getPartyStrikeBonus"]>>,
  context: KitContext,
  nicole: Combatant,
  strike: KitStrike,
  enemy: Enemy,
): number =>
  NICOLE_KIT.getPartyStrikeBonus?.(
    nicole,
    strike,
    enemy,
    context.party,
    context.kitEffectState.effects,
    context.characterIdCombatantMap,
  )?.[field] ?? 0;

describe(createNicoleKitBehaviour, () => {
  const TRAVELER_HIT = takeOne(takeOne(TRAVELER_KIT.normalAttacks).hits);

  // A strike of the Traveler's normal attack, dealt under the attack tag given, which the Nicole kit's
  // Strike hooks read
  const createTravelerStrike = (context: KitContext, traveler: Combatant, attackTag?: AttackTag): KitStrike => ({
    attackTag,
    body: context.body,
    combatant: traveler,
    hit: TRAVELER_HIT,
  });

  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    expect([
      takeOne(NICOLE_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(NICOLE_KIT.elementalBurst.hits).talentMultiplier,
      NICOLE_KIT.plungeCollision.talentMultiplier,
      takeOne(NICOLE_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(NICOLE_KIT.highPlunge.hits).talentMultiplier,
    ]).toStrictEqual([1.384, 3.168, 0.568288, 1.136335, 1.419344]);
  });

  test("her skill's hit lands at 9 frames as Pyro, cooling for 16 seconds", () => {
    expect.hasAssertions();
    const [skillHit] = NICOLE_KIT.elementalSkill.hits;
    expect(skillHit?.element).toBe(Element.Pyro);
    expect(Math.round(takeOne(NICOLE_KIT.elementalSkill.hits).hitmarkSeconds * 60)).toBe(9);
    expect(NICOLE_KIT.skillCooldownSeconds).toBe(16);
  });

  test("her skill shields the team at 2.21184 of her attack plus 1386.6697 at level 1, from 8 frames in", () => {
    expect.hasAssertions();
    const nicole = createNicoleCombatant(1000);
    const context = createKitTestContext(nicole);
    NICOLE_KIT.elementalSkill.onStart?.(context);

    stepKitSeconds(context, 7 / 60);
    expect(context.kitEffectState.effects.filter(({ kind }) => kind === "shield")).toStrictEqual([]);
    stepKitSeconds(context, 1 / 60);
    const shields = context.kitEffectState.effects.filter((effect): effect is KitShield => effect.kind === "shield");
    expect(shields.map(({ characterId, element, health }) => ({ characterId, element, health }))).toStrictEqual([
      {
        characterId: NICOLE_CHARACTER_ID,
        element: Element.Pyro,
        health: 2.21184 * nicole.attributes.attack + 1386.6697,
      },
    ]);
  });

  test.each([
    { attack: 1000, expected: 82.5, name: "a team member gets 8.25% of her attack as ATK below the cap" },
    { attack: 10_000, expected: 330, name: "a team member gets the cap as ATK when 8.25% of her attack passes it" },
  ])("her skill's team buff: $name", ({ attack, expected }) => {
    expect.hasAssertions();
    const nicole = createNicoleCombatant(attack);
    const traveler: Combatant = { ...nicole, characterId: TRAVELER_CHARACTER_ID, kit: TRAVELER_KIT };
    const context = createKitTestContext(nicole, {
      characterIdCombatantMap: new Map([
        [NICOLE_CHARACTER_ID, nicole],
        [TRAVELER_CHARACTER_ID, traveler],
      ]),
      party: createParty([NICOLE_CHARACTER_ID, TRAVELER_CHARACTER_ID]),
    });
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);

    const buffs = context.kitEffectState.effects.filter((effect): effect is KitBuff => effect.kind === "buff");
    expect(buffs.map(({ amount, attribute, characterId }) => ({ amount, attribute, characterId }))).toStrictEqual([
      { amount: expected, attribute: Attribute.Attack, characterId: NICOLE_CHARACTER_ID },
      { amount: expected, attribute: Attribute.Attack, characterId: TRAVELER_CHARACTER_ID },
    ]);
  });

  test("her burst's hit lands at 108 frames as Pyro, costing 60 energy and cooling for 15 seconds", () => {
    expect.hasAssertions();
    const burstHit = takeOne(NICOLE_KIT.elementalBurst.hits);
    expect(burstHit.element).toBe(Element.Pyro);
    expect(Math.round(burstHit.hitmarkSeconds * 60)).toBe(108);
    expect(NICOLE_KIT.burstEnergyCost).toBe(60);
    expect(NICOLE_KIT.burstCooldownSeconds).toBe(15);
  });

  test("her burst's projection of a physical hit is dealt as her own element", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const { context, enemy, nicole } = createProjectionScene(onKitEvent);
    NICOLE_KIT.elementalBurst.onStart?.(context);
    stepKitSeconds(context, 109 / 60);
    emitKitEvent({ element: undefined, enemy, kind: KitEventKind.EnemyHit, striker: nicole }, context);

    stepKitSeconds(context, 30 / 60);
    expect(onKitEvent.mock.calls.map(([event]) => event)).toContainEqual({
      element: Element.Pyro,
      enemy,
      kind: KitEventKind.EnemyHit,
      striker: nicole,
    });
  });

  test("her burst's projection lands 30 frames after the hit that starts it", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const { context, enemy, nicole } = createProjectionScene(onKitEvent);
    NICOLE_KIT.elementalBurst.onStart?.(context);
    stepKitSeconds(context, 109 / 60);
    emitKitEvent(createEnemyHit(enemy, nicole), context);

    stepKitSeconds(context, 29 / 60);
    expect(countDamageTaken(onKitEvent)).toBe(0);
    stepKitSeconds(context, 1 / 60);
    expect(countDamageTaken(onKitEvent)).toBe(1);
  });

  test("her burst makes no projection for a hit before its status starts 109 frames in", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const { context, enemy, nicole } = createProjectionScene(onKitEvent);
    NICOLE_KIT.elementalBurst.onStart?.(context);
    stepKitSeconds(context, 108 / 60);
    emitKitEvent(createEnemyHit(enemy, nicole), context);

    stepKitSeconds(context, 1);
    expect(countDamageTaken(onKitEvent)).toBe(0);
  });

  test("her burst holds its projections to one each 3 seconds", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const { context, enemy, nicole } = createProjectionScene(onKitEvent);
    NICOLE_KIT.elementalBurst.onStart?.(context);
    stepKitSeconds(context, 109 / 60);
    emitKitEvent(createEnemyHit(enemy, nicole), context);
    stepKitSeconds(context, 1);
    emitKitEvent(createEnemyHit(enemy, nicole), context);

    stepKitSeconds(context, 91 / 60);
    expect(countDamageTaken(onKitEvent)).toBe(1);
  });

  test("her burst's projections stop at four", () => {
    expect.hasAssertions();
    const HIT_COUNT = 5;
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const { context, enemy, nicole } = createProjectionScene(onKitEvent);
    NICOLE_KIT.elementalBurst.onStart?.(context);
    stepKitSeconds(context, 109 / 60);
    for (let hit = 0; hit < HIT_COUNT; hit++) {
      emitKitEvent(createEnemyHit(enemy, nicole), context);
      stepKitSeconds(context, 186 / 60);
    }

    expect(countDamageTaken(onKitEvent)).toBe(4);
  });

  test("her burst projects a physical hit of the active character too", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const { context, enemy, nicole } = createProjectionScene(onKitEvent);
    NICOLE_KIT.elementalBurst.onStart?.(context);
    stepKitSeconds(context, 109 / 60);
    emitKitEvent({ element: undefined, enemy, kind: KitEventKind.EnemyHit, striker: nicole }, context);

    stepKitSeconds(context, 30 / 60);
    expect(countDamageTaken(onKitEvent)).toBe(1);
  });

  test("her burst makes no projection for a hit by a character other than her active one", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const { context, enemy, traveler } = createProjectionScene(onKitEvent);
    NICOLE_KIT.elementalBurst.onStart?.(context);
    stepKitSeconds(context, 109 / 60);
    emitKitEvent(createEnemyHit(enemy, traveler), context);

    stepKitSeconds(context, 1);
    expect(countDamageTaken(onKitEvent)).toBe(0);
  });

  test("her first ascension gives the character swapped in ATK 300 three seconds on, for as long as her skill's buff stands", () => {
    expect.hasAssertions();
    const { context } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), { ascension: 1 });
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);
    emitSwap(context, TRAVELER_CHARACTER_ID, NICOLE_CHARACTER_ID);

    stepKitSeconds(context, 179 / 60);
    expect(getBuffs(context, TRAVELER_CHARACTER_ID)).toHaveLength(1);
    stepKitSeconds(context, 1 / 60);
    const buffs = getBuffs(context, TRAVELER_CHARACTER_ID);
    const skill = takeOne(buffs, 0);
    const ascension = takeOne(buffs, 1);
    expect({ amount: ascension.amount, attribute: ascension.attribute, kind: ascension.kind }).toStrictEqual({
      amount: 300,
      attribute: Attribute.Attack,
      kind: "buff",
    });
    expect(ascension.secondsRemaining).toBeCloseTo(skill.secondsRemaining);
  });

  test("her first ascension gives nothing to a team below the first ascension", () => {
    expect.hasAssertions();
    const { context } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>());
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);
    emitSwap(context, TRAVELER_CHARACTER_ID, NICOLE_CHARACTER_ID);

    stepKitSeconds(context, 3);
    expect(getBuffs(context, TRAVELER_CHARACTER_ID)).toHaveLength(1);
  });

  test("her first ascension gives a Hexerei swapped in its ATK at once", () => {
    expect.hasAssertions();
    const { context } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), { ascension: 1 });
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);
    emitSwap(context, TRAVELER_CHARACTER_ID, NICOLE_CHARACTER_ID);
    emitSwap(context, NICOLE_CHARACTER_ID, TRAVELER_CHARACTER_ID);

    stepKitSeconds(context, 1 / 60);
    expect(getBuffs(context, NICOLE_CHARACTER_ID)).toHaveLength(2);
  });

  test("a swap made before an earlier swap's upgrade lands cancels that upgrade", () => {
    expect.hasAssertions();
    const { context } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), { ascension: 1 });
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);
    emitSwap(context, TRAVELER_CHARACTER_ID, NICOLE_CHARACTER_ID);
    stepKitSeconds(context, 1);
    emitSwap(context, NICOLE_CHARACTER_ID, TRAVELER_CHARACTER_ID);

    stepKitSeconds(context, 3);
    expect(getBuffs(context, TRAVELER_CHARACTER_ID)).toHaveLength(1);
  });

  test("a swap away takes the ascension buff off the character it leaves before her sixth constellation", () => {
    expect.hasAssertions();
    const { context } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), { ascension: 1 });
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);
    emitSwap(context, TRAVELER_CHARACTER_ID, NICOLE_CHARACTER_ID);
    stepKitSeconds(context, 3);
    expect(getBuffs(context, TRAVELER_CHARACTER_ID)).toHaveLength(2);

    emitSwap(context, NICOLE_CHARACTER_ID, TRAVELER_CHARACTER_ID);
    expect(getBuffs(context, TRAVELER_CHARACTER_ID)).toHaveLength(1);
  });

  test("her skill's cast takes off every ascension buff before its own land", () => {
    expect.hasAssertions();
    const { context } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), { ascension: 1 });
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);
    emitSwap(context, TRAVELER_CHARACTER_ID, NICOLE_CHARACTER_ID);
    stepKitSeconds(context, 3);
    expect(getBuffs(context, TRAVELER_CHARACTER_ID)).toHaveLength(2);

    NICOLE_KIT.elementalSkill.onStart?.(context);
    expect(getBuffs(context, TRAVELER_CHARACTER_ID)).toHaveLength(0);
  });

  test("her fourth ascension gives her an ATK buff of eight seconds on each elemental hit of the active character", () => {
    expect.hasAssertions();
    const { context, enemy, nicole } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), { ascension: 4 });
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);
    emitKitEvent(createEnemyHit(enemy, nicole), context);

    expect(
      getBuffs(context, NICOLE_CHARACTER_ID).map(({ amount, attribute, secondsRemaining }) => ({
        amount,
        attribute,
        secondsRemaining,
      })),
    ).toContainEqual({ amount: 300, attribute: Attribute.Attack, secondsRemaining: 8 });
  });

  test("her fourth ascension gives her nothing on a physical hit", () => {
    expect.hasAssertions();
    const { context, enemy, nicole } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), { ascension: 4 });
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);
    emitKitEvent({ ...createEnemyHit(enemy, nicole), element: undefined }, context);

    expect(getBuffs(context, NICOLE_CHARACTER_ID)).toHaveLength(1);
  });

  test("her first constellation projects each hit of the active character at six times, 30 frames on", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const { context, enemy, nicole } = createProjectionScene(onKitEvent, { constellationCount: 1 });
    emitKitEvent(createEnemyHit(enemy, nicole), context);

    stepKitSeconds(context, 29 / 60);
    expect(getDamageTakenMultipliers(onKitEvent)).toStrictEqual([]);
    stepKitSeconds(context, 1 / 60);
    expect(getDamageTakenMultipliers(onKitEvent)).toStrictEqual([6]);
  });

  test("her first constellation projects a physical hit of the active character too", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const { context, enemy, nicole } = createProjectionScene(onKitEvent, { constellationCount: 1 });
    emitKitEvent({ ...createEnemyHit(enemy, nicole), element: undefined }, context);

    stepKitSeconds(context, 30 / 60);
    expect(getDamageTakenMultipliers(onKitEvent)).toStrictEqual([6]);
  });

  test("her first constellation's projections cool for six seconds", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const { context, enemy, nicole } = createProjectionScene(onKitEvent, { constellationCount: 1 });
    emitKitEvent(createEnemyHit(enemy, nicole), context);
    stepKitSeconds(context, 1);
    emitKitEvent(createEnemyHit(enemy, nicole), context);
    stepKitSeconds(context, 5.5);
    emitKitEvent(createEnemyHit(enemy, nicole), context);

    stepKitSeconds(context, 30 / 60);
    expect(getDamageTakenMultipliers(onKitEvent)).toStrictEqual([6, 6]);
  });

  test("her first constellation projects only the active character's hits", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const { context, enemy, traveler } = createProjectionScene(onKitEvent, { constellationCount: 1 });
    emitKitEvent(createEnemyHit(enemy, traveler), context);

    stepKitSeconds(context, 1);
    expect(getDamageTakenMultipliers(onKitEvent)).toStrictEqual([]);
  });

  test("her first constellation gives no projection below it", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const { context, enemy, nicole } = createProjectionScene(onKitEvent);
    emitKitEvent(createEnemyHit(enemy, nicole), context);

    stepKitSeconds(context, 1);
    expect(getDamageTakenMultipliers(onKitEvent)).toStrictEqual([]);
  });

  test("her second constellation gives each deployed member ATK 300 from her skill's snapshot", () => {
    expect.hasAssertions();
    const { context } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), { constellationCount: 2 });
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);

    const constellation = takeOne(getBuffs(context, TRAVELER_CHARACTER_ID), 1);
    expect({
      amount: constellation.amount,
      attribute: constellation.attribute,
      secondsRemaining: constellation.secondsRemaining,
    }).toStrictEqual({ amount: 300, attribute: Attribute.Attack, secondsRemaining: 20 });
  });

  test("her second constellation gives nothing below it", () => {
    expect.hasAssertions();
    const { context } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), { constellationCount: 1 });
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);

    expect(getBuffs(context, TRAVELER_CHARACTER_ID)).toHaveLength(1);
  });

  test("her next skill's cast takes off the team's second-constellation buff", () => {
    expect.hasAssertions();
    const { context } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), { constellationCount: 2 });
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);
    expect(getBuffs(context, TRAVELER_CHARACTER_ID)).toHaveLength(2);

    NICOLE_KIT.elementalSkill.onStart?.(context);
    expect(getBuffs(context, TRAVELER_CHARACTER_ID)).toHaveLength(0);
  });

  test("her second constellation lowers an enemy's Hydro RES by a quarter within 10 metres while an upgraded buff stands", () => {
    expect.hasAssertions();
    const { context, enemy } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), {
      ascension: 1,
      constellationCount: 2,
    });
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);
    emitSwap(context, TRAVELER_CHARACTER_ID, NICOLE_CHARACTER_ID);

    stepKitSeconds(context, 3.5);
    expect(enemy.statuses.map(({ resistanceReduction }) => resistanceReduction)).toStrictEqual([
      { [Element.Hydro]: 0.25 },
    ]);
  });

  test("her second constellation's RES reduction reaches no enemy beyond 10 metres of the team", () => {
    expect.hasAssertions();
    const { context, enemy } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), {
      ascension: 1,
      constellationCount: 2,
    });
    enemy.position = { x: 12, z: 0 };
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);
    emitSwap(context, TRAVELER_CHARACTER_ID, NICOLE_CHARACTER_ID);

    stepKitSeconds(context, 3.5);
    expect(enemy.statuses).toStrictEqual([]);
  });

  test("her second constellation lowers no RES without an upgraded character", () => {
    expect.hasAssertions();
    const { context, enemy } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), {
      ascension: 1,
      constellationCount: 2,
    });
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);

    stepKitSeconds(context, 3.5);
    expect(enemy.statuses).toStrictEqual([]);
  });

  test("her fourth constellation gives an upgraded character 0.7 of her attack to each of its strikes", () => {
    expect.hasAssertions();
    const { context, enemy, nicole, traveler } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), {
      ascension: 1,
      constellationCount: 4,
    });
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);
    emitSwap(context, TRAVELER_CHARACTER_ID, NICOLE_CHARACTER_ID);
    stepKitSeconds(context, 3);

    expect(
      getPartyStrikeBonus(
        "additiveBaseDamageBonus",
        context,
        nicole,
        createTravelerStrike(context, traveler, AttackTag.NormalAttack),
        enemy,
      ),
    ).toBe(700);
  });

  test("her fourth constellation gives nothing below it", () => {
    expect.hasAssertions();
    const { context, enemy, nicole, traveler } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), {
      ascension: 1,
      constellationCount: 3,
    });
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);
    emitSwap(context, TRAVELER_CHARACTER_ID, NICOLE_CHARACTER_ID);
    stepKitSeconds(context, 3);

    expect(
      getPartyStrikeBonus(
        "additiveBaseDamageBonus",
        context,
        nicole,
        createTravelerStrike(context, traveler, AttackTag.NormalAttack),
        enemy,
      ),
    ).toBe(0);
  });

  test("her fourth constellation's bonus takes one of eight stacks on each hit its character lands", () => {
    expect.hasAssertions();
    const { context, enemy, nicole, traveler } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), {
      ascension: 1,
      constellationCount: 4,
    });
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);
    emitSwap(context, TRAVELER_CHARACTER_ID, NICOLE_CHARACTER_ID);
    stepKitSeconds(context, 3);
    const strike = createTravelerStrike(context, traveler, AttackTag.NormalAttack);

    emitEnemyHits(context, enemy, traveler, AttackTag.NormalAttack, 7);
    expect(getPartyStrikeBonus("additiveBaseDamageBonus", context, nicole, strike, enemy)).toBe(700);
    emitEnemyHits(context, enemy, traveler, AttackTag.NormalAttack, 1);
    expect(getPartyStrikeBonus("additiveBaseDamageBonus", context, nicole, strike, enemy)).toBe(0);
  });

  test("her fourth constellation's bonus neither reaches nor takes a stack from a hit with no attack tag", () => {
    expect.hasAssertions();
    const { context, enemy, nicole, traveler } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), {
      ascension: 1,
      constellationCount: 4,
    });
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);
    emitSwap(context, TRAVELER_CHARACTER_ID, NICOLE_CHARACTER_ID);
    stepKitSeconds(context, 3);
    emitEnemyHits(context, enemy, traveler, undefined, 8);

    expect(
      getPartyStrikeBonus(
        "additiveBaseDamageBonus",
        context,
        nicole,
        createTravelerStrike(context, traveler, AttackTag.NormalAttack),
        enemy,
      ),
    ).toBe(700);
    expect(
      getPartyStrikeBonus("additiveBaseDamageBonus", context, nicole, createTravelerStrike(context, traveler), enemy),
    ).toBe(0);
  });

  test("her fourth constellation waits 16 seconds before an upgraded character gets eight stacks again", () => {
    expect.hasAssertions();
    const { context, enemy, nicole, traveler } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), {
      ascension: 1,
      constellationCount: 4,
    });
    const strike = createTravelerStrike(context, traveler, AttackTag.NormalAttack);
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);
    emitSwap(context, TRAVELER_CHARACTER_ID, NICOLE_CHARACTER_ID);
    stepKitSeconds(context, 3);
    emitEnemyHits(context, enemy, traveler, AttackTag.NormalAttack, 8);

    // Upgraded again 10 seconds on, within the cooldown, which leaves the spent stacks spent
    stepKitSeconds(context, 7);
    emitSwap(context, TRAVELER_CHARACTER_ID, NICOLE_CHARACTER_ID);
    stepKitSeconds(context, 3);
    expect(getPartyStrikeBonus("additiveBaseDamageBonus", context, nicole, strike, enemy)).toBe(0);

    // Her skill is cast again past the cooldown, and the next upgrade gives eight stacks
    stepKitSeconds(context, 7);
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);
    emitSwap(context, TRAVELER_CHARACTER_ID, NICOLE_CHARACTER_ID);
    stepKitSeconds(context, 3);
    expect(getPartyStrikeBonus("additiveBaseDamageBonus", context, nicole, strike, enemy)).toBe(700);
  });

  test("her fourth constellation gives her own strikes 0.7 of her attack too", () => {
    expect.hasAssertions();
    const { context, enemy, nicole } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), {
      ascension: 1,
      constellationCount: 4,
    });
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);
    emitSwap(context, NICOLE_CHARACTER_ID, TRAVELER_CHARACTER_ID);
    stepKitSeconds(context, 3);
    const strike: KitStrike = {
      attackTag: AttackTag.ElementalSkill,
      body: context.body,
      combatant: nicole,
      hit: TRAVELER_HIT,
    };

    expect(
      NICOLE_KIT.getStrikeAdditiveBaseDamageBonus?.(
        strike,
        enemy,
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      ),
    ).toBe(700);
  });

  test("her sixth constellation ignores 40% of an upgraded character's defence on its hits, and none before the upgrade", () => {
    expect.hasAssertions();
    const { context, enemy, nicole, traveler } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), {
      ascension: 1,
      constellationCount: 6,
    });
    const strike = createTravelerStrike(context, traveler, AttackTag.NormalAttack);
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);
    expect(getPartyStrikeBonus("defenseIgnored", context, nicole, strike, enemy)).toBe(0);

    emitSwap(context, TRAVELER_CHARACTER_ID, NICOLE_CHARACTER_ID);
    stepKitSeconds(context, 3);
    expect(getPartyStrikeBonus("defenseIgnored", context, nicole, strike, enemy)).toBe(0.4);
  });

  test("her sixth constellation ignores 40% of defence on her own upgraded hits", () => {
    expect.hasAssertions();
    const { context, enemy, nicole } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), {
      ascension: 1,
      constellationCount: 6,
    });
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);
    emitSwap(context, NICOLE_CHARACTER_ID, TRAVELER_CHARACTER_ID);
    stepKitSeconds(context, 3);
    const strike: KitStrike = {
      attackTag: AttackTag.ElementalSkill,
      body: context.body,
      combatant: nicole,
      hit: TRAVELER_HIT,
    };

    expect(NICOLE_KIT.getStrikeDefenceIgnored?.(strike, enemy, context.party, context.kitEffectState.effects)).toBe(
      0.4,
    );
  });

  test("her sixth constellation holds her fourth ascension's buff on herself as long as her skill's buff stands", () => {
    expect.hasAssertions();
    const { context, enemy, nicole } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), {
      ascension: 4,
      constellationCount: 6,
    });
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);
    emitKitEvent(createEnemyHit(enemy, nicole), context);
    stepKitSeconds(context, 10);

    expect(getBuffs(context, NICOLE_CHARACTER_ID).map(({ source }) => source)).toContain("nicole-a1");
  });

  test("her sixth constellation upgrades each other member for as long as her skill's buff stands when she is upgraded", () => {
    expect.hasAssertions();
    const { context } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), {
      ascension: 1,
      constellationCount: 6,
    });
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);
    emitSwap(context, NICOLE_CHARACTER_ID, TRAVELER_CHARACTER_ID);
    stepKitSeconds(context, 3);

    const buffs = getBuffs(context, TRAVELER_CHARACTER_ID);
    const skill = buffs.find(({ source }) => source === "grace-of-kenosis");
    const upgrade = buffs.find(({ source }) => source === "nicole-a1");
    assert.exists(skill);
    assert.exists(upgrade);
    expect(upgrade.secondsRemaining).toBeCloseTo(skill.secondsRemaining);
  });

  test("her sixth constellation keeps the ascension buff on the character she swaps away from", () => {
    expect.hasAssertions();
    const { context } = createProjectionScene(vi.fn<NonNullable<Kit["onKitEvent"]>>(), {
      ascension: 1,
      constellationCount: 6,
    });
    NICOLE_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 8 / 60);
    emitSwap(context, TRAVELER_CHARACTER_ID, NICOLE_CHARACTER_ID);
    stepKitSeconds(context, 3);

    emitSwap(context, NICOLE_CHARACTER_ID, TRAVELER_CHARACTER_ID);
    expect(getBuffs(context, TRAVELER_CHARACTER_ID).map(({ source }) => source)).toContain("nicole-a1");
  });
});
