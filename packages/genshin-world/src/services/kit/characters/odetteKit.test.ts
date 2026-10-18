import type { Reaction } from "#src/models/combat/Reaction";
import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitSummon } from "#src/models/kit/KitSummon";
import type { KitActionRecord } from "#src/models/kit/record/KitActionRecord";
import type { KitHitRecord } from "#src/models/kit/record/KitHitRecord";
import type { KitRecord } from "#src/models/kit/record/KitRecord";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { KitPlunge } from "#src/models/kit/record/KitPlunge";
import { KitTargeting } from "#src/models/kit/record/KitTargeting";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { STELLAR_VORTEX_LEVEL_TWO_STACKS } from "#src/services/combat/damage/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { buildKit } from "#src/services/kit/buildKit";
import { createOdetteKitBehaviour, ODETTE_CHARACTER_ID } from "#src/services/kit/characters/odetteKit";
import { STELLAR_VORTEX_MAX_STACKS } from "#src/services/kit/constants";
import { createKitBody } from "#src/services/kit/createKitBody";
import { castKitAction, createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { createParty } from "#src/services/party/createParty";
import { getPartyStellarReactionTypes } from "#src/services/party/getPartyStellarReactionTypes";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
// The vortex's id and its stacks, shaped as the effects read for a test to compare
const shapeEffects = (context: KitContext) =>
  context.kitEffectState.effects.map((effect) =>
    effect.kind === "summon" ? { id: effect.id, stacks: effect.stacks } : effect.kind,
  );

const DANCE_DOUBLE_ID = "danceDouble";
// The Dance Double a summon leaves on the effects, and the frames each of its hits falls at from its summon
const checkIsDanceDouble = (effect: KitEffect): effect is KitSummon =>
  effect.kind === "summon" && effect.id === DANCE_DOUBLE_ID;
const findDanceDoubles = (kitEffectState: KitEffectState) => kitEffectState.effects.filter(checkIsDanceDouble);
const toHitFrames = ({ hits }: KitSummon) => hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60));

describe(createOdetteKitBehaviour, () => {
  const PROUD_SKILL_GROUP_ID = 1;
  const TALENT_MULTIPLIER_MAP: TalentMultiplierMap = { [PROUD_SKILL_GROUP_ID]: [{ level: 1, paramList: [0.5] }] };
  const TALENT_LEVEL_MAP = { [PROUD_SKILL_GROUP_ID]: 1 };
  const HIT_RECORD: KitHitRecord = {
    area: { angle: 2 * Math.PI, height: 2, radius: 1 },
    hitmarkFrames: 12,
    multiplier: { index: 0, proudSkillGroupId: PROUD_SKILL_GROUP_ID },
    poiseDamage: 0,
  };
  const PLUME_HIT_RECORD: KitHitRecord = {
    area: { angle: 2 * Math.PI, height: 2, radius: 19 },
    hitmarkFrames: 134,
    multiplier: { index: 0, proudSkillGroupId: PROUD_SKILL_GROUP_ID },
    poiseDamage: 0,
  };
  const WING_HIT_RECORD: KitHitRecord = {
    area: { angle: 2 * Math.PI, height: 2, radius: 20 },
    hitmarkFrames: 243,
    multiplier: { index: 0, proudSkillGroupId: PROUD_SKILL_GROUP_ID },
    poiseDamage: 0,
  };
  const createFollowUpRecord = (): KitActionRecord => ({
    animationFrames: 76,
    hits: [HIT_RECORD],
    targeting: KitTargeting.Skill,
  });
  const createActionRecord = (): KitActionRecord => ({
    animationFrames: 30,
    hits: [HIT_RECORD],
    targeting: KitTargeting.Strike,
  });
  const RECORD: KitRecord = {
    areas: {},
    burst: createActionRecord(),
    burstCooldownSeconds: 15,
    chargedAttack: createActionRecord(),
    chargedAttackStamina: 20,
    frames: {
      danceDoubleBurstFirstTick: 252,
      danceDoubleBurstSpawn: 1,
      danceDoubleDuration: 1262,
      danceDoubleRecastFirstTick: 114,
      danceDoubleFirstTick: 134,
      danceDoubleSkillSpawn: 23,
      plumeTickInterval: 109,
      stellarVortex: 181,
      wingTickInterval: 125,
    },
    hits: { plume: PLUME_HIT_RECORD, wing: WING_HIT_RECORD },
    normalAttacks: [createActionRecord()],
    plungeCollision: HIT_RECORD,
    plunges: { [KitPlunge.High]: createActionRecord(), [KitPlunge.Low]: createActionRecord() },
    skill: createActionRecord(),
    skillCooldownSeconds: 6,
    skillHolds: [],
    skillChain: { followUps: [createFollowUpRecord()], windowSeconds: 394 / 60 },
    stellarJubilee: { stellarReactionTypes: [StellarReactionType.StellarConduct, StellarReactionType.StellarSwirl] },
  };
  const kit: Kit = buildKit(RECORD, TALENT_MULTIPLIER_MAP, TALENT_LEVEL_MAP, createOdetteKitBehaviour);
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
    ).toStrictEqual([{ id: "stellarVortex", secondsRemaining: 181 / 60 }]);
  });

  // Triggers a Stellar Swirl on the field into a context kept across calls, so a vortex's stacks carry from one to the next
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

    expect(shapeEffects(context)).toStrictEqual([{ id: "stellarVortex", stacks: STELLAR_VORTEX_LEVEL_TWO_STACKS }]);
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

    expect(shapeEffects(context)).toStrictEqual([{ id: "stellarVortex", stacks: STELLAR_VORTEX_MAX_STACKS - 1 }]);

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
    const vortex = createKitSummon(context.body, combatant, [], { id: "stellarVortex", stacks: 1 });

    kit.onKitEvent?.({ effect: vortex, kind: KitEventKind.EffectExpired }, context, combatant);

    expect(struckEnemy.health).toBeLessThan(struckEnemy.maxHealth);
  });

  test("a Stellar Jubilee passive enables both reactions for its party", () => {
    expect.hasAssertions();

    expect(
      getPartyStellarReactionTypes(new Map([[ODETTE_CHARACTER_ID, combatant]]), createParty([ODETTE_CHARACTER_ID])),
    ).toStrictEqual([StellarReactionType.StellarConduct, StellarReactionType.StellarSwirl]);
  });

  test("a skill press summons a Dance Double whose Plume lands 157 frames after the press, then alternates with Wing", () => {
    expect.hasAssertions();

    expect(
      findDanceDoubles(castKitAction(kit.elementalSkill, combatant)).map((summon) => toHitFrames(summon)),
    ).toStrictEqual([[157, 266, 391, 500, 625, 734, 859, 968, 1093, 1202]]);
  });

  test("a Dance Double runs out with its status, 1262 frames after its summon", () => {
    expect.hasAssertions();

    expect(
      findDanceDoubles(castKitAction(kit.elementalSkill, combatant)).map(({ secondsRemaining }) =>
        Math.round(secondsRemaining * 60),
      ),
    ).toStrictEqual([1285]);
  });

  test("a Coda recast restarts the Dance Double on a Plume 114 frames after the recast, on the status it has", () => {
    expect.hasAssertions();
    const kitEffectState = castKitAction(kit.elementalSkill, combatant);
    stepKitSeconds(createKitTestContext(combatant, { kitEffectState }), 200 / 60);

    for (const followUp of kit.elementalSkillChain?.followUps ?? []) castKitAction(followUp, combatant, kitEffectState);

    expect(findDanceDoubles(kitEffectState).map((summon) => toHitFrames(summon))).toStrictEqual([
      [157, 314, 423, 548, 657, 782, 891, 1016, 1125, 1250],
    ]);
    // The 200 frames stepped run down the status's 1285, which the recast does not renew
    expect(
      findDanceDoubles(kitEffectState).map(({ secondsRemaining }) => Math.round(secondsRemaining * 60)),
    ).toStrictEqual([1085]);
  });

  test("a burst with no Dance Double standing summons one whose Plume lands 253 frames after the burst", () => {
    expect.hasAssertions();

    expect(
      findDanceDoubles(castKitAction(kit.elementalBurst, combatant)).map((summon) => toHitFrames(summon)),
    ).toStrictEqual([[253, 362, 487, 596, 721, 830, 955, 1064, 1189]]);
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
    ).toStrictEqual([[253, 378, 487, 612, 721, 846, 955, 1080, 1189]]);
  });
});
