import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { Mock } from "vitest";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createNicoleKitBehaviour, NICOLE_CHARACTER_ID } from "#src/services/kit/characters/nicoleKit";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

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

// A team of Nicole and the Traveler on one enemy at the body's origin, with the Traveler's kit hearing what the team's events
// Report, so each projection's damage shows in its count
const createProjectionScene = (onKitEvent: Kit["onKitEvent"]) => {
  const nicole = createNicoleCombatant(1000);
  const traveler: Combatant = {
    ...nicole,
    characterId: TRAVELER_CHARACTER_ID,
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

const createEnemyHit = (enemy: Enemy, striker: Combatant): KitEvent => ({
  element: Element.Pyro,
  enemy,
  kind: KitEventKind.EnemyHit,
  striker,
});

// The projections a team's kit heard land, each reported as the damage its enemy takes
const countDamageTaken = (onKitEvent: Mock<NonNullable<Kit["onKitEvent"]>>): number =>
  onKitEvent.mock.calls.filter(([event]) => event.kind === KitEventKind.DamageTaken).length;

describe(createNicoleKitBehaviour, () => {
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
    const shields = context.kitEffectState.effects.filter(({ kind }) => kind === "shield");
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

    const buffs = context.kitEffectState.effects.filter(({ kind }) => kind === "buff");
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
});
