import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { AuraType } from "#src/models/combat/AuraType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { EnemyFamily } from "#src/models/enemy/EnemyFamily";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { strikeKitEnemies } from "#src/services/kit/strikeKitEnemies";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const KIT_HIT = takeOne(takeOne(TRAVELER_KIT.normalAttacks).hits);

const createCombatant = (onKitEvent: Kit["onKitEvent"], attack = 1000): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.Attack, value: attack }]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  element: Element.Anemo,
  elementalResonances: [],
  kit: { ...TRAVELER_KIT, onKitEvent },
  level: 90,
});

// Strikes one enemy with a hit, aimed at it through the target, and returns the kinds of the events the team's kits saw
const strikeWithHit = (
  hit: KitHit,
  enemy: ReturnType<typeof createEnemy>,
  combatant: Combatant,
  attackTag?: AttackTag,
) => {
  const context = createKitTestContext(combatant, { enemyMap: new Map([[enemy.id, enemy]]), enemyTables });
  const strikes: KitStrike[] = [{ attackTag, body: context.body, combatant, hit, target: enemy }];
  strikeKitEnemies(strikes, context);
};

describe(strikeKitEnemies, () => {
  test("sends the team's kits an elemental hit that carries the element it was dealt as", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const combatant = createCombatant(onKitEvent);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    strikeWithHit({ ...KIT_HIT, element: Element.Pyro }, enemy, combatant);

    expect(onKitEvent.mock.calls.map(([event]) => event)).toContainEqual({
      element: Element.Pyro,
      enemy,
      kind: KitEventKind.ElementalHit,
      striker: combatant,
    });
  });

  test("sends the team's kits a reaction that carries the attack tag of the strike that triggered it", () => {
    expect.hasAssertions();

    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const combatant = createCombatant(onKitEvent);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    enemy.elementalState.auras.set(AuraType.Dendro, { decayRate: 0, gauge: 1, isImmutable: false });
    strikeWithHit({ ...KIT_HIT, element: Element.Pyro, gauge: 1 }, enemy, combatant, AttackTag.ElementalBurst);

    expect(onKitEvent.mock.calls.map(([event]) => event)).toContainEqual({
      attackTag: AttackTag.ElementalBurst,
      enemy,
      kind: KitEventKind.ReactionTriggered,
      reactions: [{ element: Element.Pyro, reactionType: ReactionType.Burning }],
      striker: combatant,
    });
  });

  test("prices the striker with its buffs on before the kit's strike hooks read it", () => {
    expect.hasAssertions();
    const getStrikeDamageBonus = vi.fn<NonNullable<Kit["getStrikeDamageBonus"]>>(() => 0);
    const combatant = createCombatant(vi.fn<NonNullable<Kit["onKitEvent"]>>());
    const hookCombatant: Combatant = { ...combatant, kit: { ...combatant.kit, getStrikeDamageBonus } };
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const elementalMastery: KitBuff = {
      amount: 100,
      attribute: Attribute.ElementalMastery,
      characterId: TRAVELER_CHARACTER_ID,
      kind: "buff",
      secondsRemaining: 5,
    };
    const context = createKitTestContext(hookCombatant, {
      enemyMap: new Map([[enemy.id, enemy]]),
      enemyTables,
      kitEffectState: { effects: [elementalMastery] },
    });
    strikeKitEnemies([{ body: context.body, combatant: hookCombatant, hit: KIT_HIT, target: enemy }], context);

    expect(
      getStrikeDamageBonus.mock.calls[0]?.[0].combatant.attributes.attributeTotalMap[Attribute.ElementalMastery],
    ).toBe(100);
  });

  test("gives a hit's onStrike the enemy each strike lands on, a targeted hit's and an area hit's alike", () => {
    expect.hasAssertions();
    const combatant = createCombatant(vi.fn());
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const targetedOnStrike = vi.fn<NonNullable<KitHit["onStrike"]>>();
    strikeWithHit({ ...KIT_HIT, onStrike: targetedOnStrike }, enemy, combatant);
    const areaEnemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const areaOnStrike = vi.fn<NonNullable<KitHit["onStrike"]>>();
    const context = createKitTestContext(combatant, { enemyMap: new Map([[areaEnemy.id, areaEnemy]]), enemyTables });
    const areaHit = { ...KIT_HIT, hitArea: { angle: 2 * Math.PI, height: 1000, radius: 1000 }, onStrike: areaOnStrike };
    const body = { ...context.body, position: { x: 0, z: -10 } };
    strikeKitEnemies([{ body, combatant, hit: areaHit }], context);

    expect(targetedOnStrike.mock.calls.map((call) => call[2])).toStrictEqual([enemy]);
    expect(areaOnStrike.mock.calls.map((call) => call[2])).toStrictEqual([areaEnemy]);
  });

  test("sends the team's kits no elemental hit for a hit with no element", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const combatant = createCombatant(onKitEvent);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    strikeWithHit({ ...KIT_HIT, element: undefined, gauge: undefined }, enemy, combatant);

    expect(onKitEvent.mock.calls.map(([event]) => event.kind)).not.toContain(KitEventKind.ElementalHit);
  });

  test("sends the team's kits a weak-point hit for a hit that lands on a weak point", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const combatant = createCombatant(onKitEvent);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    strikeWithHit({ ...KIT_HIT, weakPoint: true }, enemy, combatant);

    expect(onKitEvent.mock.calls.map(([event]) => event)).toContainEqual({
      enemy,
      kind: KitEventKind.WeakPointHit,
      striker: combatant,
    });
  });

  test("sends the team's kits no defeat for a hit that leaves its enemy standing", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const combatant = createCombatant(onKitEvent, 0);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    strikeWithHit(KIT_HIT, enemy, combatant);

    expect(onKitEvent.mock.calls.map(([event]) => event.kind)).not.toContain(KitEventKind.EnemyDefeated);
  });

  test("sends the team's kits a defeat for a hit that takes its enemy's health to nothing", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const combatant = createCombatant(onKitEvent);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    enemy.health = 1;
    strikeWithHit(KIT_HIT, enemy, combatant);

    expect(onKitEvent.mock.calls.map(([event]) => event)).toContainEqual({
      enemy,
      kind: KitEventKind.EnemyDefeated,
      striker: combatant,
    });
  });

  test("an aimed hit on an enemy with weak points takes one, which the team's kits see", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const enemy = { ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""), enemyFamily: EnemyFamily.Automatons };
    const combatant = createCombatant(onKitEvent);
    const context = createKitTestContext(combatant, { enemyMap: new Map([[enemy.id, enemy]]), enemyTables });
    strikeKitEnemies([{ body: context.body, combatant, hit: KIT_HIT, isAimed: true, target: enemy }], context);
    const events = onKitEvent.mock.calls.map(([event]) => event);
    const damageTaken = events.find((event) => event.kind === KitEventKind.DamageTaken);

    expect(events.map((event) => event.kind)).toContain(KitEventKind.WeakPointHit);
    expect(damageTaken?.kind === KitEventKind.DamageTaken && damageTaken.hit.weakPoint).toBe(true);
  });

  test("an aimed hit on an enemy with no weak points takes none", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const combatant = createCombatant(onKitEvent);
    const context = createKitTestContext(combatant, { enemyMap: new Map([[enemy.id, enemy]]), enemyTables });
    strikeKitEnemies([{ body: context.body, combatant, hit: KIT_HIT, isAimed: true, target: enemy }], context);

    expect(onKitEvent.mock.calls.map(([event]) => event.kind)).not.toContain(KitEventKind.WeakPointHit);
  });

  test("a hit that is not aimed takes no weak point, even on an enemy that has them", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const enemy = { ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""), enemyFamily: EnemyFamily.Automatons };
    const combatant = createCombatant(onKitEvent);
    const context = createKitTestContext(combatant, { enemyMap: new Map([[enemy.id, enemy]]), enemyTables });
    strikeKitEnemies([{ body: context.body, combatant, hit: KIT_HIT, target: enemy }], context);

    expect(onKitEvent.mock.calls.map(([event]) => event.kind)).not.toContain(KitEventKind.WeakPointHit);
  });

  test("a strike's CRIT Rate hook raises its roll, so a roll above the base rate lands a critical hit", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const combatant = {
      ...createCombatant(onKitEvent),
      kit: { ...TRAVELER_KIT, getStrikeCriticalRateBonus: () => 0.6, onKitEvent },
    };
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const context = createKitTestContext(combatant, {
      enemyMap: new Map([[enemy.id, enemy]]),
      enemyTables,
      random: () => 0.5,
    });
    strikeKitEnemies([{ body: context.body, combatant, hit: KIT_HIT, target: enemy }], context);

    expect(
      onKitEvent.mock.calls
        .map(([event]) => event)
        .filter((event) => event.kind === KitEventKind.DamageTaken)
        .map(({ isCritical }) => isCritical),
    ).toStrictEqual([true]);
  });

  test("a strike takes the CRIT DMG an effect gives its striker's element, and a strike of another element takes none", () => {
    expect.hasAssertions();
    const combatant = {
      ...createCombatant(undefined),
      attributes: computeCharacterAttributes([
        { attribute: Attribute.Attack, value: 1000 },
        { attribute: Attribute.CriticalRate, value: 0.5 },
      ]),
    };
    const cryoEffects: KitEffect[] = [
      {
        amount: 1,
        characterId: TRAVELER_CHARACTER_ID,
        element: Element.Cryo,
        kind: "elementCriticalDamage",
        secondsRemaining: 1,
      },
    ];
    const SURVIVING_HEALTH = 1e9;
    const damageOf = (element: Element, effects: KitEffect[]): number => {
      const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
      enemy.health = SURVIVING_HEALTH;
      const context = createKitTestContext(combatant, {
        enemyMap: new Map([[enemy.id, enemy]]),
        enemyTables,
        kitEffectState: { effects },
        random: () => 0,
      });
      strikeKitEnemies([{ body: context.body, combatant, hit: { ...KIT_HIT, element }, target: enemy }], context);
      return SURVIVING_HEALTH - enemy.health;
    };

    expect([
      damageOf(Element.Cryo, cryoEffects) > damageOf(Element.Cryo, []),
      damageOf(Element.Pyro, cryoEffects),
    ]).toStrictEqual([true, damageOf(Element.Pyro, [])]);
  });

  test("a strike's flat base damage hook adds to the hit, which can defeat an enemy it would not otherwise", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const combatant = {
      ...createCombatant(onKitEvent),
      kit: { ...TRAVELER_KIT, getStrikeAdditiveBaseDamageBonus: () => 1e10, onKitEvent },
    };
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    enemy.health = 1e9;
    strikeWithHit(KIT_HIT, enemy, combatant);

    expect(
      onKitEvent.mock.calls
        .map(([event]) => event)
        .filter((event) => event.kind === KitEventKind.EnemyDefeated)
        .map(({ enemy: defeated }) => defeated),
    ).toStrictEqual([enemy]);
  });
});
