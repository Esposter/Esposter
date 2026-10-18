import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitShield } from "#src/models/kit/KitShield";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AuraType } from "#src/models/combat/AuraType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { Attribute } from "#src/models/character/Attribute";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TALENT_START_LEVELS } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import {
  CITLALI_CHARACTER_ID,
  createCitlaliKitBehaviour,
  OPAL_FIRE_FIELD_ID,
} from "#src/services/kit/characters/citlaliKit";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { NIGHTSOUL_BLESSING_STATUS_ID, NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { hasKitNightsoulBlessing } from "#src/services/kit/effects/hasKitNightsoulBlessing";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { stepDeployedKits } from "#src/services/kit/stepDeployedKits";
import { strikeKitEnemies } from "#src/services/kit/strikeKitEnemies";
import { toKitSeconds } from "#src/services/kit/toKitSeconds";
import { createParty } from "#src/services/party/createParty";
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

const createCitlaliCombatantAt = (ascension: number, elementalMastery = 0): Combatant => ({
  ...createCitlaliCombatant(),
  ascension,
  attributes: computeCharacterAttributes([
    { attribute: Attribute.BaseAttack, value: 1000 },
    { attribute: Attribute.BaseHealth, value: 10_000 },
    { attribute: Attribute.ElementalMastery, value: elementalMastery },
  ]),
});

const CITLALI_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, CITLALI_CHARACTER_ID);
// Citlali with her skill at level 15, whose Opal Shield reads the proud group's higher share and flat health
const CITLALI_SKILL_LEVEL_15_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, CITLALI_CHARACTER_ID, {
  ...TALENT_START_LEVELS,
  [CombatTalent.ElementalSkill]: 15,
});
// Citlali with her burst at level 15, whose Spirit Vessel skulls read the proud group's higher multiplier
const CITLALI_BURST_LEVEL_15_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, CITLALI_CHARACTER_ID, {
  ...TALENT_START_LEVELS,
  [CombatTalent.ElementalBurst]: 15,
});
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
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

const countPoints = (context: KitContext) =>
  countKitResource(context.kitEffectState.effects, CITLALI_CHARACTER_ID, NIGHTSOUL_POINTS_ID);

// An enemy standing the given metres along the x axis from the body's origin, too sturdy to die over a test
const createSturdyEnemy = (x: number): Enemy => ({
  ...createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, position: { x, z: 0 } }, ""),
  health: ENEMY_HEALTH,
  maxHealth: ENEMY_HEALTH,
});

// A team whose skill's press and two bursts put Citlali's points at 72 in the Blessing, which starts the Opal Fire at once
const createOpalFireContext = (enemies: Enemy[], combatant = createCitlaliCombatant()) => {
  const context = createKitTestContext(combatant, {
    enemyMap: new Map(enemies.map((enemy, index) => [String(index), enemy])),
    enemyTables,
  });
  CITLALI_KIT.elementalSkill.onStart?.(context);
  CITLALI_KIT.elementalBurst.onStart?.(context);
  CITLALI_KIT.elementalBurst.onStart?.(context);
  return context;
};

// Citlali's burst at the body's origin on the given enemies, each random draw taken in order as the press takes one for each
// Skull it summons, as gcsim draws each skull's delay at the press. Her skill's press may come first, to be in the Blessing
// Her points are held in, which a burst outside it does not keep
const createSkullContext = (enemies: Enemy[], draws: number[], { isInBlessing = false, kit = CITLALI_KIT } = {}) => {
  const queuedDraws = [...draws];
  const context = createKitTestContext(createCitlaliCombatant(), {
    enemyMap: new Map(enemies.map((enemy, index) => [String(index), enemy])),
    enemyTables,
    random: () => queuedDraws.shift() ?? 0,
  });
  if (isInBlessing) kit.elementalSkill.onStart?.(context);
  kit.elementalBurst.onStart?.(context);
  return context;
};

// Steps the team the given frames as stepFrames does, recording each strike that lands with the frame it lands on
const stepFrameLandings = (context: KitContext, frames: number) => {
  const landings: { frame: number; strike: KitStrike }[] = [];
  for (let frame = 1; frame <= frames; frame++) {
    stepKitEffects(FRAME_SECONDS, context);
    for (const enemy of context.enemyMap.values()) enemy.elementalState.seconds += FRAME_SECONDS;
    for (const strike of context.strikes) landings.push({ frame, strike });
    if (context.strikes.length > 0) strikeKitEnemies(context.strikes, context);
    context.strikes.length = 0;
  }
  return landings;
};

// A reaction a hit raised on an enemy, as the team's kits hear it from the striker's hit
const raiseReaction = (context: KitContext, combatant: Combatant, enemy: Enemy, reactionType: ReactionType) =>
  CITLALI_KIT.onKitEvent?.(
    { enemy, kind: KitEventKind.ReactionTriggered, reactions: [{ reactionType }], striker: combatant },
    context,
    combatant,
  );

describe(createCitlaliKitBehaviour, () => {
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
    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, CITLALI_CHARACTER_ID)).toBe(true);
    stepKitSeconds(context, 0.6);
    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, CITLALI_CHARACTER_ID)).toBe(false);
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
        onEvent: (event) => heard.push(event),
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

  test("Opal Fire takes effect at 50 points in the Blessing, not below: the skill's 24 and a burst's 24 leave it off, and the next burst starts it", () => {
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

  test("Opal Fire takes no effect outside the Blessing: points past 50 from bursts alone start no Itzpapa strike", () => {
    expect.hasAssertions();
    const enemy = createSturdyEnemy(3);
    const context = createKitTestContext(createCitlaliCombatant(), { enemyMap: new Map([["0", enemy]]), enemyTables });
    for (let burst = 0; burst < 3; burst++) CITLALI_KIT.elementalBurst.onStart?.(context);
    stepFrames(context, 118);
    expect(enemy.health).toBe(ENEMY_HEALTH);
  });

  test("Opal Fire drains eight points a second and ends once none is left, while the Blessing lasts on", () => {
    expect.hasAssertions();
    const context = createOpalFireContext([]);
    stepFrames(context, 60);
    expect(countPoints(context)).toBeCloseTo(64);
    stepFrames(context, 540);
    expect(countPoints(context)).toBe(0);
    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, CITLALI_CHARACTER_ID)).toBe(true);
  });

  test("Opal Fire ends in the step its Blessing runs out, even with points left to drain", () => {
    expect.hasAssertions();
    const context = createOpalFireContext([]);
    const hasOpalFire = () =>
      context.kitEffectState.effects.some((effect) => effect.kind === "field" && effect.id === OPAL_FIRE_FIELD_ID);
    // The Blessing has half a second left, while its 72 points would last nine seconds of Opal Fire
    const blessing = findKitStatus(context.kitEffectState.effects, CITLALI_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID);
    expect(blessing).toBeDefined();
    if (blessing) blessing.secondsRemaining = toKitSeconds(30);
    expect(hasOpalFire()).toBe(true);
    for (
      let frame = 0;
      hasKitNightsoulBlessing(context.kitEffectState.effects, CITLALI_CHARACTER_ID) && frame < 120;
      frame++
    )
      stepFrames(context, 1);
    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, CITLALI_CHARACTER_ID)).toBe(false);
    expect(hasOpalFire()).toBe(false);
  });

  test("Itzpapa's Frostfall Storm strikes the enemies within 6 metres every 59 frames, the first 59 frames after Opal Fire takes effect", () => {
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

  test("Frostfall Storm's damage lands on every hit, but its Cryo gauge applies only on the first of two hits within its 1.5-second cooldown", () => {
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

  test("a passive takes effect at its ascension phase: a Nightsoul burst on the team gives Citlali four points from Ascension 4", () => {
    expect.hasAssertions();
    const combatant = createCitlaliCombatantAt(4);
    const context = createKitTestContext(combatant);
    CITLALI_KIT.onKitEvent?.(
      { enemy: createSturdyEnemy(3), kind: KitEventKind.NightsoulBurst, striker: combatant },
      context,
      combatant,
    );
    expect(countPoints(context)).toBe(4);
  });

  test("does not take effect below its ascension phase: a Nightsoul burst gives Citlali no points below Ascension 4", () => {
    expect.hasAssertions();
    const combatant = createCitlaliCombatantAt(3);
    const context = createKitTestContext(combatant);
    CITLALI_KIT.onKitEvent?.(
      { enemy: createSturdyEnemy(3), kind: KitEventKind.NightsoulBurst, striker: combatant },
      context,
      combatant,
    );
    expect(countPoints(context)).toBe(0);
  });

  test("a passive takes effect at its ascension phase: Ice Storm adds 12 Elemental Mastery of flat damage from Ascension 4", () => {
    expect.hasAssertions();
    expect(takeOne(CITLALI_KIT.elementalBurst.hits).additiveBaseDamageBonus?.(createCitlaliCombatantAt(4, 1000))).toBe(
      12_000,
    );
  });

  test("does not take effect below its ascension phase: Ice Storm adds no flat damage below Ascension 4", () => {
    expect.hasAssertions();
    expect(takeOne(CITLALI_KIT.elementalBurst.hits).additiveBaseDamageBonus?.(createCitlaliCombatantAt(3, 1000))).toBe(
      0,
    );
  });

  test("a passive takes effect at its ascension phase: a Frostfall Storm adds 0.9 Elemental Mastery of flat damage from Ascension 4", () => {
    expect.hasAssertions();
    const combatant = createCitlaliCombatantAt(4, 1000);
    const context = createOpalFireContext([createSturdyEnemy(3)], combatant);
    stepFrames(context, 58);
    context.strikes.length = 0;
    stepKitEffects(FRAME_SECONDS, context);
    expect(context.strikes.at(-1)?.hit.additiveBaseDamageBonus?.(combatant)).toBe(900);
  });

  test("the Opal Shield comes 37 frames after the press, as a Cryo shield of Elemental Mastery times its share plus its flat health", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createCitlaliCombatantAt(0, 1000));
    CITLALI_KIT.elementalSkill.onStart?.(context);
    stepFrames(context, 36);
    expect(context.kitEffectState.effects.some((effect) => effect.kind === "shield")).toBe(false);
    stepFrames(context, 1);
    const shield = context.kitEffectState.effects.find((effect): effect is KitShield => effect.kind === "shield");
    expect(shield?.element).toBe(Element.Cryo);
    expect(shield?.health).toBeCloseTo(5.76 * 1000 + 1386.6759);
  });

  test("the Opal Shield lasts twenty seconds, then ends", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createCitlaliCombatantAt(0, 1000));
    CITLALI_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, toKitSeconds(37 + 19 * 60));
    expect(context.kitEffectState.effects.some((effect) => effect.kind === "shield")).toBe(true);
    stepKitSeconds(context, toKitSeconds(60));
    expect(context.kitEffectState.effects.some((effect) => effect.kind === "shield")).toBe(false);
  });

  test("the Opal Shield at skill level 15 grows its Elemental Mastery share to 13.68 and its flat health to 4380, from 5.76 and 1386.7 at level 1", () => {
    expect.hasAssertions();
    const shieldHealth = (combatant: Combatant) => {
      const context = createKitTestContext(combatant);
      CITLALI_SKILL_LEVEL_15_KIT.elementalSkill.onStart?.(context);
      stepFrames(context, 37);
      return context.kitEffectState.effects.find((effect): effect is KitShield => effect.kind === "shield")?.health;
    };
    // Without Elemental Mastery the shield is its flat health alone, and with 1000 it adds the share times the mastery
    expect(shieldHealth(createCitlaliCombatantAt(0, 0))).toBeCloseTo(4380.0005);
    expect(shieldHealth(createCitlaliCombatantAt(0, 1000))).toBeCloseTo(13.68 * 1000 + 4380.0005);
  });

  test("the burst's Spirit Vessel skulls summon on the first three enemies within 7 metres, each landing at its own draw 87 to 117 frames after the Ice Storm hit", () => {
    expect.hasAssertions();
    // The enemy 11 metres off is out of reach, and the one 6 metres off comes fourth, past the three summoned on
    const enemies = [
      createSturdyEnemy(-11),
      createSturdyEnemy(-6),
      createSturdyEnemy(0),
      createSturdyEnemy(6),
      { ...createSturdyEnemy(0), position: { x: 0, z: 6 } },
    ];
    const landings = stepFrameLandings(createSkullContext(enemies, [0, 0.5, 0.999]), 235);
    expect(landings.map(({ frame }) => frame)).toEqual([205, 220, 235]);
    expect(landings.map(({ strike }) => enemies.findIndex((enemy) => enemy === strike.target))).toEqual([1, 2, 3]);
  });

  test("each Spirit Vessel skull gives Citlali three Nightsoul points as it lands, on top of the burst's 24", () => {
    expect.hasAssertions();
    const context = createSkullContext(
      [createSturdyEnemy(-6), createSturdyEnemy(0), createSturdyEnemy(6)],
      [0, 0.5, 0.999],
      { isInBlessing: true },
    );
    expect(countPoints(context)).toBe(48);
    stepFrames(context, 205);
    expect(countPoints(context)).toBe(51);
    stepFrames(context, 15);
    expect(countPoints(context)).toBe(54);
    stepFrames(context, 15);
    expect(countPoints(context)).toBe(57);
  });

  test("a Spirit Vessel skull strikes the enemies within 3.5 metres of its enemy where they stand as it lands, not where they stood at the press", () => {
    expect.hasAssertions();
    // The enemy summoned on is 6 metres off at the press, and the one 9 metres off is out of reach until the enemy steps up to it
    const enemy = createSturdyEnemy(-6);
    const bystander = createSturdyEnemy(9);
    const context = createSkullContext([enemy, bystander], [0]);
    enemy.position = { x: 7.5, z: 0 };
    const landings = stepFrameLandings(context, 205);
    expect(landings.map(({ frame }) => frame)).toEqual([205, 205]);
    expect(
      landings.map(({ strike }) => [enemy, bystander].findIndex((candidate) => candidate === strike.target)),
    ).toEqual([0, 1]);
  });

  test("a Spirit Vessel skull is a Cryo hit at its talent multiplier of 1.344 at burst level 1", () => {
    expect.hasAssertions();
    const [landing] = stepFrameLandings(createSkullContext([createSturdyEnemy(0)], [0]), 205);
    expect(landing?.strike.hit.element).toBe(Element.Cryo);
    expect(landing?.strike.hit.talentMultiplier).toBeCloseTo(1.344);
  });

  test("the Spirit Vessel skull's multiplier grows with the burst's talent level, to 3.192 at level 15 from 1.344 at level 1", () => {
    expect.hasAssertions();
    const [landing] = stepFrameLandings(
      createSkullContext([createSturdyEnemy(0)], [0], { kit: CITLALI_BURST_LEVEL_15_KIT }),
      205,
    );
    expect(landing?.strike.hit.talentMultiplier).toBeCloseTo(3.192);
  });

  test("a passive takes effect at its ascension phase: a Melt during the Blessing gives Citlali sixteen points from Ascension 1", () => {
    expect.hasAssertions();
    const combatant = createCitlaliCombatantAt(1);
    const enemy = createSturdyEnemy(3);
    const context = createKitTestContext(combatant);
    CITLALI_KIT.elementalSkill.onStart?.(context);
    const points = countPoints(context);
    raiseReaction(context, combatant, enemy, ReactionType.Melt);
    expect(countPoints(context) - points).toBe(16);
  });

  test("does not take effect below its ascension phase: a Melt during the Blessing gives Citlali no points below Ascension 1", () => {
    expect.hasAssertions();
    const combatant = createCitlaliCombatantAt(0);
    const enemy = createSturdyEnemy(3);
    const context = createKitTestContext(combatant);
    CITLALI_KIT.elementalSkill.onStart?.(context);
    const points = countPoints(context);
    raiseReaction(context, combatant, enemy, ReactionType.Melt);
    expect(countPoints(context)).toBe(points);
  });

  test("the Ascension 1 points come at most every eight seconds: a Frozen within eight seconds of a Melt gives none, and one after gives sixteen more", () => {
    expect.hasAssertions();
    const combatant = createCitlaliCombatantAt(1);
    const enemy = createSturdyEnemy(3);
    const context = createKitTestContext(combatant);
    CITLALI_KIT.elementalSkill.onStart?.(context);
    raiseReaction(context, combatant, enemy, ReactionType.Melt);
    const points = countPoints(context);
    stepKitSeconds(context, 7);
    raiseReaction(context, combatant, enemy, ReactionType.Frozen);
    expect(countPoints(context)).toBe(points);
    stepKitSeconds(context, 2);
    raiseReaction(context, combatant, enemy, ReactionType.Frozen);
    expect(countPoints(context)).toBe(points + 16);
  });

  test("a Melt during the Blessing lowers the enemy's Hydro and Pyro resistance by 20% for twelve seconds", () => {
    expect.hasAssertions();
    const combatant = createCitlaliCombatantAt(1);
    const enemy = createSturdyEnemy(3);
    const context = createKitTestContext(combatant);
    CITLALI_KIT.elementalSkill.onStart?.(context);
    raiseReaction(context, combatant, enemy, ReactionType.Melt);
    const status = enemy.statuses.find(({ resistanceReduction }) => resistanceReduction !== undefined);
    expect(status?.resistanceReduction).toEqual({ [Element.Hydro]: 0.2, [Element.Pyro]: 0.2 });
    expect(status?.secondsRemaining).toBe(12);
  });

  test("a Melt outside the Blessing gives Citlali no points and lowers no resistance", () => {
    expect.hasAssertions();
    const combatant = createCitlaliCombatantAt(1);
    const enemy = createSturdyEnemy(3);
    const context = createKitTestContext(combatant);
    raiseReaction(context, combatant, enemy, ReactionType.Melt);
    expect(countPoints(context)).toBe(0);
    expect(enemy.statuses).toEqual([]);
  });
});

const TEAMMATE_CHARACTER_ID = 10_000_002;

// Citlali's Elemental Mastery as the team's buffs and passives price it for the given combatant
const getBuffedMastery = (combatant: Combatant, context: KitContext): number =>
  getBuffedCombatant(combatant, context.kitEffectState.effects, context.party, context.characterIdCombatantMap)
    .attributes.attributeTotalMap[Attribute.ElementalMastery];

// Citlali at the given constellation, with a teammate beside her in the deployed team, the context standing at Citlali
const createCitlaliTeam = (constellationCount: number) => {
  const citlali = { ...createCitlaliCombatant(), constellationCount };
  const teammate = { ...createCitlaliCombatant(), characterId: TEAMMATE_CHARACTER_ID };
  const context = createKitTestContext(citlali, {
    characterIdCombatantMap: new Map<number, Combatant>([
      [citlali.characterId, citlali],
      [teammate.characterId, teammate],
    ]),
    party: createParty([citlali.characterId, teammate.characterId]),
  });
  return { citlali, context, teammate };
};

// The frames a step runs as the world does: the team's effects, then each deployed kit's clock, which a teammate's buff reads
const stepTeamFrames = (context: KitContext, frames: number): void => {
  for (let frame = 0; frame < frames; frame++) {
    stepKitEffects(FRAME_SECONDS, context);
    stepDeployedKits(context, FRAME_SECONDS);
  }
};

describe("constellation 2", () => {
  test("Citlali gets 125 Elemental Mastery from Constellation 2, and none below it", () => {
    expect.hasAssertions();
    const { citlali, context } = createCitlaliTeam(0);
    const base = getBuffedMastery(citlali, context);
    expect(getBuffedMastery({ ...citlali, constellationCount: 1 }, context) - base).toBe(0);
    expect(getBuffedMastery({ ...citlali, constellationCount: 2 }, context) - base).toBe(125);
  });

  test("a teammate gets 250 Elemental Mastery while Citlali's Blessing holds on the field", () => {
    expect.hasAssertions();
    const { context, teammate } = createCitlaliTeam(2);
    const base = getBuffedMastery(teammate, context);
    enterKitNightsoulBlessing(context.kitEffectState, CITLALI_CHARACTER_ID, { points: 24, secondsRemaining: 20 });
    const teammateOnField = { ...context, activeCombatant: teammate };
    stepTeamFrames(teammateOnField, 1);
    expect(getBuffedMastery(teammate, teammateOnField) - base).toBe(250);
  });

  test("a teammate gets no Elemental Mastery from Constellation 2 with neither the Blessing nor the Opal Shield", () => {
    expect.hasAssertions();
    const { context, teammate } = createCitlaliTeam(2);
    const base = getBuffedMastery(teammate, context);
    const teammateOnField = { ...context, activeCombatant: teammate };
    stepTeamFrames(teammateOnField, 1);
    expect(getBuffedMastery(teammate, teammateOnField)).toBe(base);
  });

  test("a teammate gets 250 Elemental Mastery while the Opal Shield holds, and none once it ends", () => {
    expect.hasAssertions();
    const { context, teammate } = createCitlaliTeam(2);
    castKitShield(context.kitEffectState, CITLALI_CHARACTER_ID, {
      element: Element.Cryo,
      health: 1000,
      secondsRemaining: 2,
    });
    const base = getBuffedMastery(teammate, context);
    const teammateOnField = { ...context, activeCombatant: teammate };
    stepTeamFrames(teammateOnField, 60);
    expect(getBuffedMastery(teammate, teammateOnField) - base).toBe(250);
    stepTeamFrames(teammateOnField, 180);
    expect(getBuffedMastery(teammate, teammateOnField)).toBe(base);
  });

  test("a teammate's Elemental Mastery ends with the Blessing", () => {
    expect.hasAssertions();
    const { context, teammate } = createCitlaliTeam(2);
    enterKitNightsoulBlessing(context.kitEffectState, CITLALI_CHARACTER_ID, { points: 24, secondsRemaining: 2 });
    const base = getBuffedMastery(teammate, context);
    const teammateOnField = { ...context, activeCombatant: teammate };
    stepTeamFrames(teammateOnField, 60);
    expect(getBuffedMastery(teammate, teammateOnField) - base).toBe(250);
    stepTeamFrames(teammateOnField, 180);
    expect(getBuffedMastery(teammate, teammateOnField)).toBe(base);
  });

  test("Ascension 1's Hydro and Pyro RES cut is 40% from Constellation 2", () => {
    expect.hasAssertions();
    const enemy = createSturdyEnemy(3);
    const combatant = { ...createCitlaliCombatantAt(1), constellationCount: 2 };
    const context = createKitTestContext(combatant);
    CITLALI_KIT.elementalSkill.onStart?.(context);
    raiseReaction(context, combatant, enemy, ReactionType.Melt);
    const status = enemy.statuses.find(({ resistanceReduction }) => resistanceReduction !== undefined);
    expect(status?.resistanceReduction).toEqual({ [Element.Hydro]: 0.4, [Element.Pyro]: 0.4 });
  });
});
