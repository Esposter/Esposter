import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { startJahodaRobots } from "#src/services/kit/characters/jahodaRobots";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const FRAME_SECONDS = 1 / 60;
const BURST_SECONDS = 790 / 60;

// Jahoda's robot timings as gcsim's burst.go gives them, in frames: the first check 6, a robot's spacing 41, the checks
// Every 46 and the first strike 41 after an absorb, then every 140. Her strike is 0.172664 of her ATK, as her burst skill
const SETTINGS = {
  absorbArea: { angle: 2 * Math.PI, height: 5, radius: 5 },
  absorbFirstSeconds: 6 * FRAME_SECONDS,
  absorbEnergy: 0,
  absorbIntervalSeconds: 46 * FRAME_SECONDS,
  absorbSpacingSeconds: 41 * FRAME_SECONDS,
  robotCount: 2,
  strikeFirstSeconds: 41 * FRAME_SECONDS,
  strikeHit: {
    gauge: 1,
    hitArea: { angle: 2 * Math.PI, height: 2, radius: 1.2 },
    hitmarkSeconds: 0,
    poiseDamage: 0,
    talentMultiplier: 0.172664,
  },
  strikeIntervalSeconds: 140 * FRAME_SECONDS,
  strikeTargetCount: 3,
};

const COMBATANT: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 90,
};

// An enemy at a point, holding an aura of the element given, or none
const createEnemyAt = (x: number, z: number, element?: Element) => {
  const enemy = createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, id: `robot-test-enemy-${x}-${z}` }, "");
  enemy.position = { x, z };
  if (element !== undefined) applyElement(enemy.elementalState, element, 1);
  return enemy;
};

const createRobotContext = (enemies: ReturnType<typeof createEnemyAt>[]): KitContext =>
  createKitTestContext(COMBATANT, { enemyMap: new Map(enemies.map((enemy) => [enemy.id, enemy])) });

// Each strike the steps land, with the frame it lands on, over the frames given. A hook runs before each frame's step
const readStrikes = (
  context: KitContext,
  frameCount: number,
  beforeFrame: (frame: number) => void = () => undefined,
) => {
  const strikes: { element: Element | undefined; frame: number; targetId: string | undefined }[] = [];
  for (let frame = 1; frame <= frameCount; frame++) {
    beforeFrame(frame);
    for (const strike of stepKitTestEffects(FRAME_SECONDS, context))
      strikes.push({ element: strike.hit.element, frame, targetId: strike.target?.id });
  }
  return strikes;
};

describe(startJahodaRobots, () => {
  test("a robot absorbs the aura its circle holds at its first check, then strikes 41 frames later and every 140 after", () => {
    const context = createRobotContext([createEnemyAt(2, 0, Element.Pyro)]);
    startJahodaRobots(context, COMBATANT, BURST_SECONDS, { ...SETTINGS, robotCount: 1 });
    const strikes = readStrikes(context, 800);
    expect(strikes.map(({ frame }) => frame)).toStrictEqual([47, 187, 327, 467, 607, 747]);
    expect(strikes.every(({ element }) => element === Element.Pyro)).toBe(true);
  });

  test("a robot that finds no aura checks again 46 frames later, and absorbs the aura then", () => {
    const enemy = createEnemyAt(2, 0);
    const context = createRobotContext([enemy]);
    startJahodaRobots(context, COMBATANT, BURST_SECONDS, { ...SETTINGS, robotCount: 1 });
    // The first check at 6 finds no aura, and the enemy takes one before the second check at 52
    const strikes = readStrikes(context, 800, (frame) => {
      if (frame === 30) applyElement(enemy.elementalState, Element.Hydro, 1);
    });
    expect(strikes.map(({ frame }) => frame)).toStrictEqual([93, 233, 373, 513, 653]);
    expect(strikes.every(({ element }) => element === Element.Hydro)).toBe(true);
  });

  test("a strike lands on the three nearest enemies, nearest first", () => {
    const nearest = createEnemyAt(1, 0, Element.Pyro);
    const second = createEnemyAt(2, 0);
    const third = createEnemyAt(3, 0);
    const farthest = createEnemyAt(4, 0);
    const context = createRobotContext([farthest, third, second, nearest]);
    startJahodaRobots(context, COMBATANT, BURST_SECONDS, { ...SETTINGS, robotCount: 1 });
    const firstStrike = readStrikes(context, 47).filter(({ frame }) => frame === 47);
    expect(firstStrike.map(({ targetId }) => targetId)).toStrictEqual([nearest.id, second.id, third.id]);
  });

  test("the second robot checks a spacing after the first, and strikes from its own absorb", () => {
    const context = createRobotContext([createEnemyAt(2, 0, Element.Pyro)]);
    startJahodaRobots(context, COMBATANT, BURST_SECONDS, SETTINGS);
    const strikeFrames = readStrikes(context, 800).map(({ frame }) => frame);
    expect(strikeFrames).toStrictEqual([47, 88, 187, 228, 327, 368, 467, 508, 607, 648, 747, 788]);
  });
});

describe("Jahoda's robots and Constellation 4", () => {
  test("an absorb gives her the energy the settings name", () => {
    const context = createRobotContext([createEnemyAt(1, 0, Element.Hydro)]);
    const { characterId } = COMBATANT;
    const before = getPartyMember(context.party, characterId).energy;
    startJahodaRobots(context, COMBATANT, BURST_SECONDS, { ...SETTINGS, absorbEnergy: 4, robotCount: 1 });
    for (let frame = 0; frame < 10; frame++) stepKitTestEffects(FRAME_SECONDS, context);
    expect(getPartyMember(context.party, characterId).energy).toBe(before + 4);
  });
});
