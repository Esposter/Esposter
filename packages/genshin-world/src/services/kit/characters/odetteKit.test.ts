import type { Reaction } from "#src/models/combat/Reaction";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { STELLAR_VORTEX_LEVEL_TWO_STACKS } from "#src/services/combat/damage/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import {
  createOdetteKitBehaviour,
  DANCE_DOUBLE_ID,
  ODETTE_CHARACTER_ID,
  STELLAR_VORTEX_ID,
} from "#src/services/kit/characters/odetteKit";
import { STELLAR_VORTEX_MAX_STACKS } from "#src/services/kit/constants";
import { createKitBody } from "#src/services/kit/createKitBody";
import { castKitAction, createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { readCharacterKitRecord } from "#src/services/kit/readCharacterKitRecord.test";
import { createParty } from "#src/services/party/createParty";
import { getPartyStellarReactionTypes } from "#src/services/party/getPartyStellarReactionTypes";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const kit = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, ODETTE_CHARACTER_ID);
const { readFrame } = await readCharacterKitRecord(ODETTE_CHARACTER_ID);
// The vortex's id and its stacks, shaped as the effects read for a test to compare
const shapeEffects = (context: KitContext) =>
  context.kitEffectState.effects.map((effect) =>
    effect.kind === "summon" ? { id: effect.id, stacks: effect.stacks } : effect.kind,
  );

// The Dance Double a summon leaves on the effects, and the frames each of its hits falls at from its summon
const checkIsDanceDouble = (effect: KitEffect): effect is KitSummon =>
  effect.kind === "summon" && effect.id === DANCE_DOUBLE_ID;
const findDanceDoubles = (kitEffectState: KitEffectState) => kitEffectState.effects.filter(checkIsDanceDouble);
const toHitFrames = ({ hits }: KitSummon) => hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60));

describe(createOdetteKitBehaviour, () => {
  // The frames her record gives: each spawn and first tick of the Dance Double, its status's duration, its attacks'
  // Intervals and the Stellar Vortex's lifetime, all counted from the cast that starts them
  const SKILL_SPAWN_FRAMES = readFrame("danceDoubleSkillSpawn");
  const SKILL_FIRST_TICK_FRAMES = readFrame("danceDoubleFirstTick");
  const BURST_SPAWN_FRAMES = readFrame("danceDoubleBurstSpawn");
  const BURST_FIRST_TICK_FRAMES = readFrame("danceDoubleBurstFirstTick");
  const RECAST_FIRST_TICK_FRAMES = readFrame("danceDoubleRecastFirstTick");
  const DANCE_DOUBLE_DURATION_FRAMES = readFrame("danceDoubleDuration");
  const PLUME_INTERVAL_FRAMES = readFrame("plumeTickInterval");
  const WING_INTERVAL_FRAMES = readFrame("wingTickInterval");
  const STELLAR_VORTEX_FRAMES = readFrame("stellarVortex");
  // The frames stepped before a Coda recast, which the recast's restart and the status it keeps are measured from
  const RECAST_STEP_FRAMES = 200;

  // The frames of a Dance Double's hits from its first, alternating Plume and Wing, each on the interval
  // Its attack gives
  const toDanceDoubleFrames = (firstFrame: number, startsWithPlume: boolean, count: number): number[] => {
    const frames: number[] = [];
    let frame = firstFrame;
    let isPlume = startsWithPlume;
    for (let hit = 0; hit < count; hit++) {
      frames.push(frame);
      frame += isPlume ? PLUME_INTERVAL_FRAMES : WING_INTERVAL_FRAMES;
      isPlume = !isPlume;
    }
    return frames;
  };

  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
    characterId: ODETTE_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit,
    level: 90,
  };
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  // Triggers the reactions on the enemy with Odette on the field, the body standing at the point given
  const triggerReactions = (reactions: Reaction[], bodyPosition = { x: 3, z: 4 }) => {
    const context = createKitTestContext(combatant, { body: createKitBody(bodyPosition) });
    kit.onKitEvent?.(
      { enemy, kind: KitEventKind.ReactionTriggered, reactions, striker: combatant },
      context,
      combatant,
    );
    return context.kitEffectState.effects;
  };

  test("places a Stellar Vortex where a Stellar Swirl is triggered, and places nothing for any other reaction", () => {
    expect.hasAssertions();

    const effects = triggerReactions([
      { element: Element.Electro, reactionType: ReactionType.Swirl },
      { element: Element.Cryo, reactionType: ReactionType.StellarSwirl },
      { element: Element.Cryo, reactionType: ReactionType.Melt },
    ]);

    expect(
      effects.map((effect) =>
        effect.kind === "summon" ? { id: effect.id, secondsRemaining: effect.secondsRemaining } : effect.kind,
      ),
    ).toStrictEqual([{ id: STELLAR_VORTEX_ID, secondsRemaining: STELLAR_VORTEX_FRAMES / 60 }]);
  });

  // Triggers a Stellar Swirl on the field into a context kept across calls, so a vortex's stacks carry over
  const triggerStellarSwirl = (context: KitContext) =>
    kit.onKitEvent?.(
      {
        enemy,
        kind: KitEventKind.ReactionTriggered,
        reactions: [{ element: Element.Cryo, reactionType: ReactionType.StellarSwirl }],
        striker: combatant,
      },
      context,
      combatant,
    );

  test("a standing vortex takes each further Stellar Swirl as a stack, and the third levels it up", () => {
    expect.hasAssertions();
    const context = createKitTestContext(combatant, { body: createKitBody({ x: 3, z: 4 }) });

    for (let swirl = 0; swirl < STELLAR_VORTEX_LEVEL_TWO_STACKS; swirl++) triggerStellarSwirl(context);

    expect(shapeEffects(context)).toStrictEqual([{ id: STELLAR_VORTEX_ID, stacks: STELLAR_VORTEX_LEVEL_TWO_STACKS }]);
  });

  test("three more Stellar Swirls explode a vortex at once", () => {
    expect.hasAssertions();
    const struckEnemy = createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, position: { x: 0, z: 0 } }, "");
    const context = createKitTestContext(combatant, {
      body: createKitBody({ x: 3, z: 4 }),
      enemyMap: new Map([[struckEnemy.id, struckEnemy]]),
      enemyTables,
    });

    for (let swirl = 0; swirl < STELLAR_VORTEX_LEVEL_TWO_STACKS; swirl++) triggerStellarSwirl(context);
    for (let swirl = 0; swirl < 2; swirl++) triggerStellarSwirl(context);

    expect(shapeEffects(context)).toStrictEqual([{ id: STELLAR_VORTEX_ID, stacks: STELLAR_VORTEX_MAX_STACKS - 1 }]);

    triggerStellarSwirl(context);

    expect(shapeEffects(context)).toStrictEqual([]);
    expect(struckEnemy.health).toBeLessThan(struckEnemy.maxHealth);
  });

  test("a Stellar Vortex that runs out explodes at the stacks it has", () => {
    expect.hasAssertions();
    const struckEnemy = createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, position: { x: 0, z: 0 } }, "");
    const context = createKitTestContext(combatant, {
      body: createKitBody({ x: 3, z: 4 }),
      enemyMap: new Map([[struckEnemy.id, struckEnemy]]),
      enemyTables,
    });
    const vortex = createKitSummon(context.body, combatant, [], { id: STELLAR_VORTEX_ID, stacks: 1 });

    kit.onKitEvent?.({ effect: vortex, kind: KitEventKind.EffectExpired }, context, combatant);

    expect(struckEnemy.health).toBeLessThan(struckEnemy.maxHealth);
  });

  test("a Stellar Jubilee passive enables both reactions for its party", () => {
    expect.hasAssertions();

    expect(
      getPartyStellarReactionTypes(new Map([[ODETTE_CHARACTER_ID, combatant]]), createParty([ODETTE_CHARACTER_ID])),
    ).toStrictEqual([StellarReactionType.StellarConduct, StellarReactionType.StellarSwirl]);
  });

  test("a skill press summons a Dance Double whose Plume lands at its first tick after the press, then alternates with Wing", () => {
    expect.hasAssertions();

    expect(
      findDanceDoubles(castKitAction(kit.elementalSkill, combatant)).map((summon) => toHitFrames(summon)),
    ).toStrictEqual([toDanceDoubleFrames(SKILL_SPAWN_FRAMES + SKILL_FIRST_TICK_FRAMES, true, 10)]);
  });

  test("a Dance Double runs out with its status, at the status's duration from its summon", () => {
    expect.hasAssertions();

    expect(
      findDanceDoubles(castKitAction(kit.elementalSkill, combatant)).map(({ secondsRemaining }) =>
        Math.round(secondsRemaining * 60),
      ),
    ).toStrictEqual([SKILL_SPAWN_FRAMES + DANCE_DOUBLE_DURATION_FRAMES]);
  });

  test("a Coda recast restarts the Dance Double on a Plume at its recast's first tick, on the status it has", () => {
    expect.hasAssertions();
    const kitEffectState = castKitAction(kit.elementalSkill, combatant);
    stepKitSeconds(createKitTestContext(combatant, { kitEffectState }), RECAST_STEP_FRAMES / 60);

    for (const followUp of kit.elementalSkillChain?.followUps ?? []) castKitAction(followUp, combatant, kitEffectState);

    // The first of the summon's hits has landed already, and the recast restarts the rest from its own first tick
    expect(findDanceDoubles(kitEffectState).map((summon) => toHitFrames(summon))).toStrictEqual([
      [
        SKILL_SPAWN_FRAMES + SKILL_FIRST_TICK_FRAMES,
        ...toDanceDoubleFrames(RECAST_STEP_FRAMES + RECAST_FIRST_TICK_FRAMES, true, 9),
      ],
    ]);
    // The frames stepped run down the status, which the recast does not renew
    expect(
      findDanceDoubles(kitEffectState).map(({ secondsRemaining }) => Math.round(secondsRemaining * 60)),
    ).toStrictEqual([SKILL_SPAWN_FRAMES + DANCE_DOUBLE_DURATION_FRAMES - RECAST_STEP_FRAMES]);
  });

  test("a burst with no Dance Double standing summons one whose Plume lands at its first tick after the burst", () => {
    expect.hasAssertions();

    expect(
      findDanceDoubles(castKitAction(kit.elementalBurst, combatant)).map((summon) => toHitFrames(summon)),
    ).toStrictEqual([toDanceDoubleFrames(BURST_SPAWN_FRAMES + BURST_FIRST_TICK_FRAMES, true, 9)]);
  });

  test("a burst while a Dance Double stands takes up its next attack, Wing once the Plume has landed, and ends the one standing", () => {
    expect.hasAssertions();
    const kitEffectState = castKitAction(kit.elementalSkill, combatant);
    stepKitSeconds(createKitTestContext(combatant, { kitEffectState }), 160 / 60);

    castKitAction(kit.elementalBurst, combatant, kitEffectState);

    expect(
      findDanceDoubles(kitEffectState)
        .filter(({ secondsRemaining }) => secondsRemaining > 0)
        .map((summon) => toHitFrames(summon)),
    ).toStrictEqual([toDanceDoubleFrames(BURST_SPAWN_FRAMES + BURST_FIRST_TICK_FRAMES, false, 9)]);
  });
});
