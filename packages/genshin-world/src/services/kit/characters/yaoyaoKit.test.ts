import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitField } from "#src/models/kit/KitField";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createYaoyaoKitBehaviour, YAOYAO_CHARACTER_ID } from "#src/services/kit/characters/yaoyaoKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const YAOYAO_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, YAOYAO_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

// Measured: the dump's table for Raphanus Sky Cluster at level 1 (proud skill group 7732), the share of Yaoyao's Max HP
// And the flat HP a radish heals the active character by
const SKILL_RADISH_HEAL_SHARE = 0.017143;
const SKILL_RADISH_FLAT_HEAL = 165.07991;
const MAX_HEALTH = 10_000;
// Measured: the dump's table for Moonjade Descent at level 1 (proud skill group 7739), the same two numbers for its radishes
const BURST_RADISH_HEAL_SHARE = 0.020168;
const BURST_RADISH_FLAT_HEAL = 194.21231;
const MEMBER_ID = 10_000_032;
const MEMBER_MAX_HEALTH = 20_000;
// Frames from the cast to the Yuegui's spawn, its first throw after the spawn, and the radish's hitmark after the throw.
// The engine's field counts down its ticks by summing steps of a frame, which leaves a countdown of an exact frame count
// A hair above zero, so each tick lands in the step after its frame; the tests bracket each timing by the steps either side
const YUEGUI_SPAWN_FRAMES = 63;
const YUEGUI_FIRST_THROW_FRAMES = 29;
const RADISH_HITMARK_FRAMES = 13;

const createYaoyaoCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
  characterId: YAOYAO_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: YAOYAO_KIT,
  level: 90,
  weaponType: WeaponType.Polearm,
});

// Yaoyao alone on the field at the given share of her Max HP, standing at the origin facing along the negative z axis
const createYaoyaoContext = (
  healthShare: number,
  context: Partial<KitContext> = {},
  combatant: Partial<Combatant> = {},
): KitContext => {
  const party = createParty([YAOYAO_CHARACTER_ID]);
  getPartyMember(party, YAOYAO_CHARACTER_ID).healthShare = healthShare;
  return createKitTestContext({ ...createYaoyaoCombatant(), ...combatant }, { party, ...context });
};

const createEnemyAt = (x: number, z: number) => ({
  ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
  position: { x, z },
});

// The team stepped the given frames, one fixed step each, as the world's step runs
const stepFrames = (context: KitContext, frames: number): void => {
  for (let frame = 0; frame < frames; frame++) stepKitEffects(FIXED_STEP_SECONDS, context);
};

// The Yuegui her skill spawns: the field whose throws repeat on an interval
const findYuegui = (context: KitContext): KitField | undefined =>
  context.kitEffectState.effects.find(
    (effect): effect is KitField => effect.kind === "field" && Number.isFinite(effect.tickIntervalSeconds),
  );

const findRadish = (context: KitContext): KitSummon | undefined =>
  context.kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

// The Yuegui Moonjade Descent spawns behind her, each one of its spawns adding one to those on the field
const findJumpingYuegui = (context: KitContext): KitField[] =>
  context.kitEffectState.effects.filter(
    (effect): effect is KitField => effect.kind === "field" && effect.id === "yaoyao-jumping-yuegui",
  );

describe(createYaoyaoKitBehaviour, () => {
  test("reads each talent multiplier from her proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...YAOYAO_KIT.normalAttacks.flatMap((action) => action.hits.map((hit) => hit.talentMultiplier)),
      takeOne(YAOYAO_KIT.chargedAttack.hits).talentMultiplier,
      YAOYAO_KIT.plungeCollision.talentMultiplier,
      takeOne(YAOYAO_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(YAOYAO_KIT.highPlunge.hits).talentMultiplier,
      takeOne(YAOYAO_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.510014, 0.474428, 0.313771, 0.329457, 0.779315, 1.1266, 0.639324, 1.278377, 1.596762, 1.1456,
    ];
    expect(multipliers).toStrictEqual(expectedMultipliers);
  });

  test("the cooldowns, costs and stamina her table gives", () => {
    expect.hasAssertions();
    expect([
      YAOYAO_KIT.skillCooldownSeconds,
      YAOYAO_KIT.burstCooldownSeconds,
      YAOYAO_KIT.burstEnergyCost,
      YAOYAO_KIT.chargedAttackStamina,
    ]).toStrictEqual([15, 20, 80, 25]);
  });

  test("the normal string's hitmarks, with the third strike's two hits", () => {
    expect.hasAssertions();
    const hitmarks = YAOYAO_KIT.normalAttacks.flatMap((action) =>
      action.hits.map((hit) => Math.round(hit.hitmarkSeconds * 60)),
    );
    expect(hitmarks).toStrictEqual([13, 16, 12, 31, 21]);
  });

  test("the burst's initial hit is a circle of 3 metres round the body, dealing no poise", () => {
    expect.hasAssertions();
    const hit = takeOne(YAOYAO_KIT.elementalBurst.hits);

    expect(hit.hitArea.radius).toBe(3);
    expect(hit.poiseDamage).toBe(0);
    expect(Math.round(hit.hitmarkSeconds * 60)).toBe(16);
  });

  test("raphanus sky cluster spawns the Yuegui two metres ahead of her 63 frames after the cast", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(0.5);
    YAOYAO_KIT.elementalSkill.onStart?.(context);

    stepFrames(context, YUEGUI_SPAWN_FRAMES - 1);
    expect(findYuegui(context)).toBeUndefined();
    stepFrames(context, 1);
    const yuegui = findYuegui(context);
    expect(yuegui?.centre.z).toBeCloseTo(-2);
    expect(yuegui?.centre.x).toBeCloseTo(0);
  });

  test("the Yuegui's first radish lands 29 frames after the spawn and heals the active character from her Max HP and a flat amount", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(0.5);
    YAOYAO_KIT.elementalSkill.onStart?.(context);

    stepFrames(context, YUEGUI_SPAWN_FRAMES + YUEGUI_FIRST_THROW_FRAMES - 1);
    expect(findRadish(context)).toBeUndefined();
    stepFrames(context, 2);
    expect(findRadish(context)).toBeDefined();
    stepFrames(context, RADISH_HITMARK_FRAMES - 1);
    expect(getPartyMember(context.party, YAOYAO_CHARACTER_ID).healthShare).toBe(0.5);
    stepFrames(context, 2);
    const healedShare = (SKILL_RADISH_HEAL_SHARE * MAX_HEALTH + SKILL_RADISH_FLAT_HEAL) / MAX_HEALTH;
    expect(getPartyMember(context.party, YAOYAO_CHARACTER_ID).healthShare).toBeCloseTo(0.5 + healedShare, 4);
  });

  test("a radish heals only while the body stands within its circle as it lands", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(0.5);
    YAOYAO_KIT.elementalSkill.onStart?.(context);

    stepFrames(context, YUEGUI_SPAWN_FRAMES + YUEGUI_FIRST_THROW_FRAMES + 1);
    context.body.position = { x: 5, z: 0 };
    stepFrames(context, RADISH_HITMARK_FRAMES + 1);
    expect(getPartyMember(context.party, YAOYAO_CHARACTER_ID).healthShare).toBe(0.5);
  });

  test("a radish lands on a random enemy within 8 metres of the Yuegui while the active character stands above 70% of her Max HP", () => {
    expect.hasAssertions();
    const enemy = createEnemyAt(0, -4);
    const context = createYaoyaoContext(0.8, { enemyMap: new Map([["enemy", enemy]]) });
    YAOYAO_KIT.elementalSkill.onStart?.(context);

    stepFrames(context, YUEGUI_SPAWN_FRAMES + YUEGUI_FIRST_THROW_FRAMES + 1);
    expect(findRadish(context)?.body.position.z).toBeCloseTo(-4);
  });

  test("a radish lands on her own position once the active character stands at or below 70% of her Max HP", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(0.7, { enemyMap: new Map([["enemy", createEnemyAt(0, -4)]]) });
    YAOYAO_KIT.elementalSkill.onStart?.(context);

    stepFrames(context, YUEGUI_SPAWN_FRAMES + YUEGUI_FIRST_THROW_FRAMES + 1);
    expect(findRadish(context)?.body.position.z).toBeCloseTo(0);
  });

  test("moonjade descent spawns a Yuegui behind her at 104, 162 and 221 frames, while the burst lasts", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(0.5);
    YAOYAO_KIT.elementalBurst.onStart?.(context);

    // Each spawn lands in the step after its frame, the engine's float sum leaving a countdown of 104, 162 and 221 frames a hair above zero
    stepFrames(context, 103);
    expect(findJumpingYuegui(context)).toHaveLength(0);
    stepFrames(context, 2);
    expect(findJumpingYuegui(context)).toHaveLength(1);
    expect(findJumpingYuegui(context)[0]?.centre.z).toBeCloseTo(2);
    stepFrames(context, 56);
    expect(findJumpingYuegui(context)).toHaveLength(1);
    stepFrames(context, 2);
    expect(findJumpingYuegui(context)).toHaveLength(2);
    stepFrames(context, 58);
    expect(findJumpingYuegui(context)).toHaveLength(2);
    stepFrames(context, 2);
    expect(findJumpingYuegui(context)).toHaveLength(3);
  });

  test("a jumping Yuegui's first radish lands 29 frames after it spawns and heals the whole team", () => {
    expect.hasAssertions();
    const yaoyao = createYaoyaoCombatant();
    const member = {
      ...createYaoyaoCombatant(),
      attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MEMBER_MAX_HEALTH }]),
      characterId: MEMBER_ID,
    };
    const party = createParty([YAOYAO_CHARACTER_ID, MEMBER_ID]);
    for (const characterId of [YAOYAO_CHARACTER_ID, MEMBER_ID]) getPartyMember(party, characterId).healthShare = 0.5;
    const context = createKitTestContext(yaoyao, {
      characterIdCombatantMap: new Map([
        [YAOYAO_CHARACTER_ID, yaoyao],
        [MEMBER_ID, member],
      ]),
      party,
    });
    YAOYAO_KIT.elementalBurst.onStart?.(context);

    // The first spawn lands at frame 105, so its first throw lands at 135, with the radish's heal 14 frames after it
    stepFrames(context, 132);
    expect(findRadish(context)).toBeUndefined();
    stepFrames(context, 3);
    expect(findRadish(context)).toBeDefined();
    stepFrames(context, RADISH_HITMARK_FRAMES);
    expect(getPartyMember(context.party, MEMBER_ID).healthShare).toBe(0.5);
    stepFrames(context, 2);
    const healing = BURST_RADISH_HEAL_SHARE * MAX_HEALTH + BURST_RADISH_FLAT_HEAL;
    expect(getPartyMember(context.party, YAOYAO_CHARACTER_ID).healthShare).toBeCloseTo(0.5 + healing / MAX_HEALTH, 4);
    expect(getPartyMember(context.party, MEMBER_ID).healthShare).toBeCloseTo(0.5 + healing / MEMBER_MAX_HEALTH, 4);
  });

  test("a swap ends Moonjade Descent and the Yuegui it spawned, which throws no radish", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(0.5);
    YAOYAO_KIT.elementalBurst.onStart?.(context);
    stepFrames(context, 105);
    expect(findJumpingYuegui(context)).toHaveLength(1);

    YAOYAO_KIT.onKitEvent?.(
      { characterId: MEMBER_ID, kind: KitEventKind.CharacterSwapped, previousCharacterId: YAOYAO_CHARACTER_ID },
      context,
      context.activeCombatant,
    );
    stepFrames(context, 40);
    expect(findJumpingYuegui(context)).toHaveLength(0);
    expect(findRadish(context)).toBeUndefined();
  });

  test("the Yuegui spawned at 221 frames lasts until the burst ends, six seconds from the cast", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(0.5);
    YAOYAO_KIT.elementalBurst.onStart?.(context);

    stepFrames(context, 222);
    expect(findJumpingYuegui(context).at(-1)?.secondsRemaining).toBeCloseTo(6 - 222 / 60, 1);
    stepFrames(context, 140);
    expect(findJumpingYuegui(context)).toHaveLength(0);
  });

  test("constellation 1 gives the active character 15% Dendro DMG Bonus for eight seconds after a radish heals her", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(0.5, {}, { constellationCount: 1 });
    YAOYAO_KIT.elementalSkill.onStart?.(context);

    stepFrames(context, YUEGUI_SPAWN_FRAMES + YUEGUI_FIRST_THROW_FRAMES + RADISH_HITMARK_FRAMES + 2);
    const buff = context.kitEffectState.effects.find(
      (effect) => effect.kind === "buff" && effect.attribute === Attribute.DendroDamageBonus,
    );
    expect(buff?.kind === "buff" ? [buff.amount, buff.characterId] : undefined).toStrictEqual([
      0.15,
      YAOYAO_CHARACTER_ID,
    ]);
  });

  test("ascension 4 heals the active character 0.8% of Yaoyao's Max HP each second, for five seconds after a radish heals her", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(0.5, {}, { ascension: 4 });
    YAOYAO_KIT.elementalSkill.onStart?.(context);
    stepFrames(context, YUEGUI_SPAWN_FRAMES + YUEGUI_FIRST_THROW_FRAMES + RADISH_HITMARK_FRAMES + 2);
    const healthAfterRadish = getPartyMember(context.party, YAOYAO_CHARACTER_ID).healthShare;
    // The Yuegui ends after its first radish, so the next throw's own heal does not join the chain's
    const yuegui = findYuegui(context);
    if (yuegui) yuegui.secondsRemaining = 0;

    stepFrames(context, 62);
    expect(getPartyMember(context.party, YAOYAO_CHARACTER_ID).healthShare).toBeCloseTo(healthAfterRadish + 0.008, 4);
    stepFrames(context, 360);
    const healthAfterChain = getPartyMember(context.party, YAOYAO_CHARACTER_ID).healthShare;
    stepFrames(context, 60);
    expect(getPartyMember(context.party, YAOYAO_CHARACTER_ID).healthShare).toBe(healthAfterChain);
  });
});
