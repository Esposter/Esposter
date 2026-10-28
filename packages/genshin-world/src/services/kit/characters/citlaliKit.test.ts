import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AuraType } from "#src/models/combat/AuraType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { CITLALI_CHARACTER_ID, createCitlaliKitBehaviour } from "#src/services/kit/characters/citlaliKit";
import { NIGHTSOUL_BLESSING_STATUS_ID, NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { strikeKitEnemies } from "#src/services/kit/strikeKitEnemies";
import { toKitSeconds } from "#src/services/shared/toKitSeconds";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const createCitlaliCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([
    { attribute: Attribute.BaseAttack, value: 1000 },
    { attribute: Attribute.BaseHealth, value: 10_000 },
  ]),
  characterId: CITLALI_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: CITLALI_KIT,
  level: 90,
});

const CITLALI_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, CITLALI_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

const countPoints = (context: KitContext) =>
  countKitResource(context.kitEffectState.effects, CITLALI_CHARACTER_ID, NIGHTSOUL_POINTS_ID);

// A team whose skill's press and two bursts put Citlali's points at 72 in the Blessing, which starts the Opal Fire at once
const createOpalFireContext = (enemies: Enemy[]) => {
  const context = createKitTestContext(createCitlaliCombatant(), {
    enemyMap: new Map(enemies.map((enemy, index) => [String(index), enemy])),
    enemyTables,
  });
  CITLALI_KIT.elementalSkill.onStart?.(context);
  CITLALI_KIT.elementalBurst.onStart?.(context);
  CITLALI_KIT.elementalBurst.onStart?.(context);
  return context;
};

describe(createCitlaliKitBehaviour, () => {
  const ENEMY_HEALTH = 1e9;
  // A frame of the world's seconds, the step the team's effects run on at sixty frames a second
  const FRAME_SECONDS = toKitSeconds(1);

  // Steps the team the given frames, applying the strikes each frame's step raises, as the world does
  const stepFrames = (context: KitContext, frames: number) => {
    for (let frame = 0; frame < frames; frame++) {
      stepKitEffects(FRAME_SECONDS, context);
      // The world advances each enemy's elemental clock with the frames, which an internal cooldown reads for its reset
      for (const enemy of context.enemyMap.values()) enemy.elementalState.seconds += FRAME_SECONDS;
      if (context.strikes.length > 0) strikeKitEnemies(context.strikes, context);
    }
  };

  // An enemy standing the given metres along the x axis from the body's origin, too sturdy to die over a test
  const createSturdyEnemy = (x: number): Enemy => ({
    ...createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, position: { x, z: 0 } }, ""),
    health: ENEMY_HEALTH,
    maxHealth: ENEMY_HEALTH,
  });

  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    expect([
      ...CITLALI_KIT.normalAttacks.map(({ hits }) => takeOne(hits).talentMultiplier),
      takeOne(CITLALI_KIT.chargedAttack.hits).talentMultiplier,
      takeOne(CITLALI_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(CITLALI_KIT.elementalBurst.hits).talentMultiplier,
      CITLALI_KIT.plungeCollision.talentMultiplier,
      takeOne(CITLALI_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(CITLALI_KIT.highPlunge.hits).talentMultiplier,
    ]).toStrictEqual([0.434072, 0.388136, 0.537712, 0.992, 0.7296, 5.376, 0.568288, 1.136335, 1.419344]);
  });

  test("the strikes land 10 frames after their hitmarks, at 16, 16 and 36", () => {
    expect.hasAssertions();
    expect(CITLALI_KIT.normalAttacks.map(({ hits }) => Math.round(takeOne(hits).hitmarkSeconds * 60))).toStrictEqual([
      26, 26, 46,
    ]);
    expect(CITLALI_KIT.normalAttacks.map(({ seconds }) => Math.round(seconds * 60))).toStrictEqual([38, 39, 52]);
  });

  test("the charged attack hits at 50 frames of a 56-frame animation, costing 50 stamina", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(CITLALI_KIT.chargedAttack.hits).hitmarkSeconds * 60)).toBe(50);
    expect(Math.round(CITLALI_KIT.chargedAttack.seconds * 60)).toBe(56);
    expect(CITLALI_KIT.chargedAttackStamina).toBe(50);
  });

  test("the skill's hit lands at 20 frames and cools for 16 seconds", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(CITLALI_KIT.elementalSkill.hits).hitmarkSeconds * 60)).toBe(20);
    expect(CITLALI_KIT.skillCooldownSeconds).toBe(16);
  });

  test("ice Storm hits at 118 frames, costing 60 energy and cooling for 15 seconds", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(CITLALI_KIT.elementalBurst.hits).hitmarkSeconds * 60)).toBe(118);
    expect(CITLALI_KIT.burstEnergyCost).toBe(60);
    expect(CITLALI_KIT.burstCooldownSeconds).toBe(15);
  });

  test("the low plunge and the high plunge land at Bennett's hitmarks, 36 and 38 frames", () => {
    expect.hasAssertions();
    expect(takeOne(CITLALI_KIT.lowPlunge.hits).hitmarkSeconds).toBe(36 / 60);
    expect(takeOne(CITLALI_KIT.highPlunge.hits).hitmarkSeconds).toBe(38 / 60);
  });

  test("the skill's press enters the Nightsoul Blessing with its points plus 24, which last twenty seconds", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createCitlaliCombatant());
    CITLALI_KIT.elementalSkill.onStart?.(context);
    expect(countKitResource(context.kitEffectState.effects, CITLALI_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(24);
    stepKitSeconds(context, 19.5);
    expect(checkHasKitStatus(context.kitEffectState.effects, CITLALI_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)).toBe(
      true,
    );
    stepKitSeconds(context, 0.6);
    expect(checkHasKitStatus(context.kitEffectState.effects, CITLALI_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)).toBe(
      false,
    );
  });

  test("the burst gains 24 Nightsoul points", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createCitlaliCombatant());
    CITLALI_KIT.elementalBurst.onStart?.(context);
    expect(countKitResource(context.kitEffectState.effects, CITLALI_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(24);
  });

  test("the burst's 24 points raise a Nightsoul generation event, which the team's fields hear", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createCitlaliCombatant());
    const heard: KitEvent[] = [];
    castKitField(
      context.kitEffectState,
      CITLALI_CHARACTER_ID,
      { x: 0, z: 0 },
      {
        nextTickSeconds: 100,
        onEvent: (event) => {
          heard.push(event);
        },
        onTick: () => {},
        secondsRemaining: 10,
        tickIntervalSeconds: 1,
      },
    );
    CITLALI_KIT.elementalBurst.onStart?.(context);
    expect(heard).toStrictEqual([
      { characterId: CITLALI_CHARACTER_ID, kind: KitEventKind.NightsoulPointsGained, points: 24 },
    ]);
  });

  test("opal Fire takes effect at 50 points in the Blessing, not below: the skill's 24 and a burst's 24 leave it off, and the next burst starts it", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createCitlaliCombatant());
    CITLALI_KIT.elementalSkill.onStart?.(context);
    CITLALI_KIT.elementalBurst.onStart?.(context);
    stepFrames(context, 60);
    expect(countPoints(context)).toBe(48);
    CITLALI_KIT.elementalBurst.onStart?.(context);
    stepFrames(context, 60);
    expect(countPoints(context)).toBeCloseTo(64);
  });

  test("opal Fire takes no effect outside the Blessing: points past 50 from bursts alone start no Itzpapa strike", () => {
    expect.hasAssertions();
    const enemy = createSturdyEnemy(3);
    const context = createKitTestContext(createCitlaliCombatant(), { enemyMap: new Map([["0", enemy]]), enemyTables });
    for (let burst = 0; burst < 3; burst++) CITLALI_KIT.elementalBurst.onStart?.(context);
    stepFrames(context, 118);
    expect(enemy.health).toBe(ENEMY_HEALTH);
  });

  test("opal Fire drains eight points a second and ends once none is left, while the Blessing lasts on", () => {
    expect.hasAssertions();
    const context = createOpalFireContext([]);
    stepFrames(context, 60);
    expect(countPoints(context)).toBeCloseTo(64);
    stepFrames(context, 540);
    expect(countPoints(context)).toBe(0);
    expect(checkHasKitStatus(context.kitEffectState.effects, CITLALI_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID)).toBe(
      true,
    );
  });

  test("itzpapa's Frostfall Storm strikes the enemies within 6 metres every 59 frames, the first 59 frames after Opal Fire takes effect", () => {
    expect.hasAssertions();
    const near = createSturdyEnemy(3);
    const far = createSturdyEnemy(8);
    const context = createOpalFireContext([near, far]);
    stepFrames(context, 58);
    expect(near.health).toBe(ENEMY_HEALTH);
    stepFrames(context, 1);
    const afterFirstStorm = near.health;
    expect(afterFirstStorm).toBeLessThan(ENEMY_HEALTH);
    expect(far.health).toBe(ENEMY_HEALTH);
    stepFrames(context, 58);
    expect(near.health).toBe(afterFirstStorm);
    stepFrames(context, 1);
    expect(near.health).toBeLessThan(afterFirstStorm);
  });

  test("frostfall Storm's damage lands on every hit, but its Cryo gauge applies only on the first of two hits within its 1.5-second cooldown", () => {
    expect.hasAssertions();
    const enemy = createSturdyEnemy(3);
    const context = createOpalFireContext([enemy]);
    stepFrames(context, 59);
    expect(enemy.elementalState.auras.has(AuraType.Cryo)).toBe(true);
    enemy.elementalState.auras.delete(AuraType.Cryo);
    const afterFirstStorm = enemy.health;
    stepFrames(context, 59);
    expect(enemy.health).toBeLessThan(afterFirstStorm);
    expect(enemy.elementalState.auras.has(AuraType.Cryo)).toBe(false);
    stepFrames(context, 59);
    expect(enemy.elementalState.auras.has(AuraType.Cryo)).toBe(true);
  });
});
