import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
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
import { createKitTestContext, stepKitSecondsStriking } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { readCharacterKitRecord } from "#src/services/kit/readCharacterKitRecord.test";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { LocomotionState } from "genshin-engine";
import { describe, expect, test } from "vitest";

const YAOYAO_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, YAOYAO_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const { readFrame, readFrameList, readHits, readRecordParameter } = await readCharacterKitRecord(YAOYAO_CHARACTER_ID);

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

// Every radish on the field, in the order they were thrown
const findRadishes = (context: KitContext): KitSummon[] =>
  context.kitEffectState.effects.filter((effect): effect is KitSummon => effect.kind === "summon");

const findRadish = (context: KitContext): KitSummon | undefined => findRadishes(context)[0];

// The Yuegui Moonjade Descent spawns behind her, each one of its spawns adding one to those on the field
const findJumpingYuegui = (context: KitContext): KitField[] =>
  context.kitEffectState.effects.filter(
    (effect): effect is KitField => effect.kind === "field" && effect.id === "yaoyao-jumping-yuegui",
  );

// The buffs on the field for an attribute, in the order they were added
const findBuffs = (context: KitContext, attribute: Attribute): KitBuff[] =>
  context.kitEffectState.effects.filter(
    (effect): effect is KitBuff => effect.kind === "buff" && effect.attribute === attribute,
  );

describe(createYaoyaoKitBehaviour, () => {
  // A radish's heal, its share of Yaoyao's Max HP and its flat amount, for the skill's radish and the burst's
  const SKILL_RADISH_HEAL_SHARE = readRecordParameter("skillRadishHealMaxHealthShare");
  const SKILL_RADISH_FLAT_HEAL = readRecordParameter("skillRadishFlatHeal");
  const MAX_HEALTH = 10_000;
  const BURST_RADISH_HEAL_SHARE = readRecordParameter("burstRadishHealMaxHealthShare");
  const BURST_RADISH_FLAT_HEAL = readRecordParameter("burstRadishFlatHeal");
  const MEMBER_ID = 10_000_032;
  const MEMBER_MAX_HEALTH = 20_000;
  // Frames from the cast to the Yuegui's spawn, its first throw after the spawn, and the radish's hitmark after the
  // Throw. Each tick lands on the step its frame names, so a test steps to that frame and one frame short of it
  const YUEGUI_SPAWN_FRAMES = readFrame("skillCooldownStart") + readFrame("yueguiSpawnDelay");
  const YUEGUI_FIRST_THROW_FRAMES = readFrame("yueguiFirstThrow");
  const YUEGUI_THROW_INTERVAL_FRAMES = readFrame("yueguiThrowInterval");
  const RADISH_HITMARK_FRAMES = takeOne(readHits("skillRadish")).hitmarkFrames;
  const MEGA_RADISH_HITMARK_FRAMES = takeOne(readHits("megaRadish")).hitmarkFrames;
  // The frames after the cast at which her burst spawns each Yuegui behind her, and the frames the burst lasts
  const JUMPING_YUEGUI_SPAWN_FRAMES = readFrameList("jumpingYueguiSpawns");
  const BURST_DURATION_FRAMES = readFrame("burstDuration");
  const readJumpingYueguiSpawnFrame = (index: number): number => takeOne(JUMPING_YUEGUI_SPAWN_FRAMES, index);

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

  test("raphanus sky cluster spawns the Yuegui two metres ahead of her at its spawn frame after the cast", () => {
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

  test("the Yuegui's first radish lands at its first throw after the spawn and heals the active character from her Max HP and a flat amount", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(0.5);
    YAOYAO_KIT.elementalSkill.onStart?.(context);

    stepFrames(context, YUEGUI_SPAWN_FRAMES + YUEGUI_FIRST_THROW_FRAMES - 1);
    expect(findRadish(context)).toBeUndefined();
    stepFrames(context, 1);
    expect(findRadish(context)).toBeDefined();
    stepFrames(context, RADISH_HITMARK_FRAMES - 1);
    expect(getPartyMember(context.party, YAOYAO_CHARACTER_ID).healthShare).toBe(0.5);
    stepFrames(context, 1);
    const healedShare = (SKILL_RADISH_HEAL_SHARE * MAX_HEALTH + SKILL_RADISH_FLAT_HEAL) / MAX_HEALTH;
    expect(getPartyMember(context.party, YAOYAO_CHARACTER_ID).healthShare).toBeCloseTo(0.5 + healedShare, 4);
  });

  test("a radish heals only while the body stands within its circle as it lands", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(0.5);
    YAOYAO_KIT.elementalSkill.onStart?.(context);

    stepFrames(context, YUEGUI_SPAWN_FRAMES + YUEGUI_FIRST_THROW_FRAMES);
    context.body.position = { x: 5, z: 0 };
    stepFrames(context, RADISH_HITMARK_FRAMES);
    expect(getPartyMember(context.party, YAOYAO_CHARACTER_ID).healthShare).toBe(0.5);
  });

  test("a radish lands on a random enemy within 8 metres of the Yuegui while the active character stands above 70% of her Max HP", () => {
    expect.hasAssertions();
    const enemy = createEnemyAt(0, -4);
    const context = createYaoyaoContext(0.8, { enemyMap: new Map([["enemy", enemy]]) });
    YAOYAO_KIT.elementalSkill.onStart?.(context);

    stepFrames(context, YUEGUI_SPAWN_FRAMES + YUEGUI_FIRST_THROW_FRAMES);
    expect(findRadish(context)?.body.position.z).toBeCloseTo(-4);
  });

  test("a radish lands on her own position once the active character stands at or below 70% of her Max HP", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(0.7, { enemyMap: new Map([["enemy", createEnemyAt(0, -4)]]) });
    YAOYAO_KIT.elementalSkill.onStart?.(context);

    stepFrames(context, YUEGUI_SPAWN_FRAMES + YUEGUI_FIRST_THROW_FRAMES);
    expect(findRadish(context)?.body.position.z).toBeCloseTo(0);
  });

  test("moonjade descent spawns a Yuegui behind her at each of its spawn frames, while the burst lasts", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(0.5);
    YAOYAO_KIT.elementalBurst.onStart?.(context);

    // Each spawn lands on the step its frame names, so a test steps to the frame before it and then onto it
    stepFrames(context, readJumpingYueguiSpawnFrame(0) - 1);
    expect(findJumpingYuegui(context)).toHaveLength(0);
    stepFrames(context, 1);
    expect(findJumpingYuegui(context)).toHaveLength(1);
    expect(findJumpingYuegui(context)[0]?.centre.z).toBeCloseTo(2);
    stepFrames(context, readJumpingYueguiSpawnFrame(1) - readJumpingYueguiSpawnFrame(0) - 1);
    expect(findJumpingYuegui(context)).toHaveLength(1);
    stepFrames(context, 1);
    expect(findJumpingYuegui(context)).toHaveLength(2);
    stepFrames(context, readJumpingYueguiSpawnFrame(2) - readJumpingYueguiSpawnFrame(1) - 1);
    expect(findJumpingYuegui(context)).toHaveLength(2);
    stepFrames(context, 1);
    expect(findJumpingYuegui(context)).toHaveLength(3);
  });

  test("a jumping Yuegui's first radish lands at its first throw after it spawns and heals the whole team", () => {
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

    // The first spawn's first throw lands YUEGUI_FIRST_THROW_FRAMES after the spawn, with the radish's heal after it
    stepFrames(context, readJumpingYueguiSpawnFrame(0) + YUEGUI_FIRST_THROW_FRAMES - 1);
    expect(findRadish(context)).toBeUndefined();
    stepFrames(context, 1);
    expect(findRadish(context)).toBeDefined();
    stepFrames(context, RADISH_HITMARK_FRAMES - 1);
    expect(getPartyMember(context.party, MEMBER_ID).healthShare).toBe(0.5);
    stepFrames(context, 1);
    const healing = BURST_RADISH_HEAL_SHARE * MAX_HEALTH + BURST_RADISH_FLAT_HEAL;
    expect(getPartyMember(context.party, YAOYAO_CHARACTER_ID).healthShare).toBeCloseTo(0.5 + healing / MAX_HEALTH, 4);
    expect(getPartyMember(context.party, MEMBER_ID).healthShare).toBeCloseTo(0.5 + healing / MEMBER_MAX_HEALTH, 4);
  });

  test("a swap ends Moonjade Descent and the Yuegui it spawned, which throws no radish", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(0.5);
    YAOYAO_KIT.elementalBurst.onStart?.(context);
    stepFrames(context, readJumpingYueguiSpawnFrame(0));
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

  test("the Yuegui spawned last lasts until the burst ends, at the burst's duration from the cast", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(0.5);
    YAOYAO_KIT.elementalBurst.onStart?.(context);

    stepFrames(context, readJumpingYueguiSpawnFrame(2));
    expect(findJumpingYuegui(context)).toHaveLength(3);
    stepFrames(context, BURST_DURATION_FRAMES - readJumpingYueguiSpawnFrame(2) - 1);
    expect(findJumpingYuegui(context)).toHaveLength(3);
    stepFrames(context, 1);
    expect(findJumpingYuegui(context)).toHaveLength(0);
  });

  test("ascension 1 throws a radish at an enemy within 8 metres 0.6 seconds into the burst and every 0.6 seconds after, while she dashes or jumps", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(
      0.5,
      { enemyMap: new Map([["enemy", createEnemyAt(0, -4)]]), locomotionState: LocomotionState.Dash },
      { ascension: 1 },
    );
    YAOYAO_KIT.elementalBurst.onStart?.(context);

    stepFrames(context, 35);
    expect(findRadishes(context)).toHaveLength(0);
    stepFrames(context, 1);
    expect(findRadishes(context)).toHaveLength(1);
    expect(findRadishes(context)[0]?.body.position.z).toBeCloseTo(-4);
    stepFrames(context, 35);
    expect(findRadishes(context)).toHaveLength(0);
    stepFrames(context, 1);
    expect(findRadishes(context)).toHaveLength(1);
  });

  test.each([
    [LocomotionState.Idle, 4],
    [LocomotionState.Dash, 9],
  ])("ascension 1 throws no radish while she is %s with an enemy %i metres away", (locomotionState, distanceMetres) => {
    expect.hasAssertions();
    const context = createYaoyaoContext(
      0.5,
      { enemyMap: new Map([["enemy", createEnemyAt(0, -distanceMetres)]]), locomotionState },
      { ascension: 1 },
    );
    YAOYAO_KIT.elementalBurst.onStart?.(context);

    stepFrames(context, 36);
    expect(findRadishes(context)).toHaveLength(0);
  });

  test("ascension 1 throws no radish once a swap ends the burst", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(
      0.5,
      { enemyMap: new Map([["enemy", createEnemyAt(0, -4)]]), locomotionState: LocomotionState.Dash },
      { ascension: 1 },
    );
    YAOYAO_KIT.elementalBurst.onStart?.(context);
    YAOYAO_KIT.onKitEvent?.(
      { characterId: MEMBER_ID, kind: KitEventKind.CharacterSwapped, previousCharacterId: YAOYAO_CHARACTER_ID },
      context,
      context.activeCombatant,
    );

    stepFrames(context, 36);
    expect(findRadishes(context)).toHaveLength(0);
  });

  test("constellation 1 gives the active character 15% Dendro DMG Bonus for eight seconds after a radish heals her", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(0.5, {}, { constellationCount: 1 });
    YAOYAO_KIT.elementalSkill.onStart?.(context);

    stepFrames(context, YUEGUI_SPAWN_FRAMES + YUEGUI_FIRST_THROW_FRAMES + RADISH_HITMARK_FRAMES - 1);
    expect(findBuffs(context, Attribute.DendroDamageBonus)).toHaveLength(0);
    stepFrames(context, 1);
    const buff = context.kitEffectState.effects.find(
      (effect) => effect.kind === "buff" && effect.attribute === Attribute.DendroDamageBonus,
    );
    expect(buff?.kind === "buff" ? [buff.amount, buff.characterId] : undefined).toStrictEqual([
      0.15,
      YAOYAO_CHARACTER_ID,
    ]);
  });

  test("constellation 1 restores 15 stamina to the party's pool on a radish heal, once each 5 seconds", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(0.5, {}, { constellationCount: 1 });
    context.stamina.value = 50;
    YAOYAO_KIT.elementalSkill.onStart?.(context);

    // The first radish heals at its hitmark, and the ones one and two throw intervals after it fall inside its five
    // Seconds
    stepFrames(context, YUEGUI_SPAWN_FRAMES + YUEGUI_FIRST_THROW_FRAMES + RADISH_HITMARK_FRAMES);
    expect(context.stamina.value).toBe(65);
    stepFrames(context, 2 * YUEGUI_THROW_INTERVAL_FRAMES);
    expect(context.stamina.value).toBe(65);
    // The heal at 465 frames comes 360 frames after the first, past the cooldown
    stepFrames(context, 240);
    expect(context.stamina.value).toBe(80);
  });

  test("constellation 1 restores no stamina without the constellation", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(0.5);
    context.stamina.value = 50;
    YAOYAO_KIT.elementalSkill.onStart?.(context);

    stepFrames(context, YUEGUI_SPAWN_FRAMES + YUEGUI_FIRST_THROW_FRAMES + RADISH_HITMARK_FRAMES);
    expect(context.stamina.value).toBe(50);
  });

  test("ascension 4 heals the active character 0.8% of Yaoyao's Max HP each second, for five seconds after a radish heals her", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(0.5, {}, { ascension: 4 });
    YAOYAO_KIT.elementalSkill.onStart?.(context);
    stepFrames(context, YUEGUI_SPAWN_FRAMES + YUEGUI_FIRST_THROW_FRAMES + RADISH_HITMARK_FRAMES);
    const healthAfterRadish = getPartyMember(context.party, YAOYAO_CHARACTER_ID).healthShare;
    // The Yuegui ends after its first radish, so the next throw's own heal does not join the chain's
    const yuegui = findYuegui(context);
    if (yuegui) yuegui.secondsRemaining = 0;

    // The chain's heals fall 60 frames after the radish's heal, then every 60 frames, five of them in all, the last
    // At 300
    stepFrames(context, 59);
    expect(getPartyMember(context.party, YAOYAO_CHARACTER_ID).healthShare).toBeCloseTo(healthAfterRadish, 4);
    stepFrames(context, 1);
    expect(getPartyMember(context.party, YAOYAO_CHARACTER_ID).healthShare).toBeCloseTo(healthAfterRadish + 0.008, 4);
    stepFrames(context, 240);
    expect(getPartyMember(context.party, YAOYAO_CHARACTER_ID).healthShare).toBeCloseTo(healthAfterRadish + 0.04, 4);
    stepFrames(context, 60);
    expect(getPartyMember(context.party, YAOYAO_CHARACTER_ID).healthShare).toBeCloseTo(healthAfterRadish + 0.04, 4);
  });

  test("constellation 2 gives Yaoyao 3 energy when a burst radish strikes an enemy while the burst lasts", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(
      0.8,
      { enemyTables, enemyMap: new Map([["enemy", createEnemyAt(0, -4)]]) },
      { constellationCount: 2 },
    );
    YAOYAO_KIT.elementalBurst.onStart?.(context);

    // The first spawn's radish is thrown at its first throw and strikes at its hitmark after the throw
    const firstStrikeFrames = readJumpingYueguiSpawnFrame(0) + YUEGUI_FIRST_THROW_FRAMES + RADISH_HITMARK_FRAMES;
    stepKitSecondsStriking(context, (firstStrikeFrames - 1) * FIXED_STEP_SECONDS);
    expect(getPartyMember(context.party, YAOYAO_CHARACTER_ID).energy).toBe(0);
    stepKitSecondsStriking(context, FIXED_STEP_SECONDS);
    expect(getPartyMember(context.party, YAOYAO_CHARACTER_ID).energy).toBe(3);
  });

  test("constellation 2 gives no energy from a skill radish that strikes an enemy once the burst has ended", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(
      0.8,
      { enemyTables, enemyMap: new Map([["enemy", createEnemyAt(0, -4)]]) },
      { constellationCount: 2 },
    );
    YAOYAO_KIT.elementalBurst.onStart?.(context);
    YAOYAO_KIT.onKitEvent?.(
      { characterId: MEMBER_ID, kind: KitEventKind.CharacterSwapped, previousCharacterId: YAOYAO_CHARACTER_ID },
      context,
      context.activeCombatant,
    );
    YAOYAO_KIT.elementalSkill.onStart?.(context);

    // The skill's first radish strikes at its spawn, its first throw and its hitmark after the cast, the burst already
    // Ended
    stepKitSecondsStriking(
      context,
      (YUEGUI_SPAWN_FRAMES + YUEGUI_FIRST_THROW_FRAMES + RADISH_HITMARK_FRAMES) * FIXED_STEP_SECONDS,
    );
    expect(getPartyMember(context.party, YAOYAO_CHARACTER_ID).energy).toBe(0);
  });

  test("constellation 2 gives 3 energy once each 0.8 seconds, however many enemies a radish strikes", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(
      0.8,
      {
        enemyTables,
        enemyMap: new Map([
          ["first", createEnemyAt(0, -4)],
          ["second", createEnemyAt(0, -4)],
        ]),
      },
      { constellationCount: 2 },
    );
    YAOYAO_KIT.elementalBurst.onStart?.(context);

    // Both enemies are struck at the first strike, for one 3 energy; the next spawn's radish strikes a spawn gap later,
    // Past the cooldown
    const firstStrikeFrames = readJumpingYueguiSpawnFrame(0) + YUEGUI_FIRST_THROW_FRAMES + RADISH_HITMARK_FRAMES;
    const secondStrikeFrames = readJumpingYueguiSpawnFrame(1) + YUEGUI_FIRST_THROW_FRAMES + RADISH_HITMARK_FRAMES;
    stepKitSecondsStriking(context, (firstStrikeFrames - 1) * FIXED_STEP_SECONDS);
    expect(getPartyMember(context.party, YAOYAO_CHARACTER_ID).energy).toBe(0);
    stepKitSecondsStriking(context, FIXED_STEP_SECONDS);
    expect(getPartyMember(context.party, YAOYAO_CHARACTER_ID).energy).toBe(3);
    stepKitSecondsStriking(context, (secondStrikeFrames - firstStrikeFrames - 1) * FIXED_STEP_SECONDS);
    expect(getPartyMember(context.party, YAOYAO_CHARACTER_ID).energy).toBe(3);
    stepKitSecondsStriking(context, FIXED_STEP_SECONDS);
    expect(getPartyMember(context.party, YAOYAO_CHARACTER_ID).energy).toBe(6);
  });

  test("constellation 4 gives Yaoyao 0.3% of her Max HP as Elemental Mastery for 8.8 seconds, which each cast restarts", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(0.5, {}, { constellationCount: 4 });
    YAOYAO_KIT.elementalSkill.onStart?.(context);
    expect(
      findBuffs(context, Attribute.ElementalMastery).map(({ amount, characterId, secondsRemaining }) => [
        amount,
        characterId,
        secondsRemaining,
      ]),
    ).toStrictEqual([[30, YAOYAO_CHARACTER_ID, 8.8]]);

    stepFrames(context, 300);
    YAOYAO_KIT.elementalBurst.onStart?.(context);
    expect(
      findBuffs(context, Attribute.ElementalMastery).map(({ amount, secondsRemaining }) => [amount, secondsRemaining]),
    ).toStrictEqual([[30, 8.8]]);
  });

  test("constellation 4's Elemental Mastery stops at 120", () => {
    expect.hasAssertions();
    const context = createYaoyaoContext(
      0.5,
      {},
      {
        attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 100_000 }]),
        constellationCount: 4,
      },
    );
    YAOYAO_KIT.elementalSkill.onStart?.(context);

    expect(findBuffs(context, Attribute.ElementalMastery).map(({ amount }) => amount)).toStrictEqual([120]);
  });

  test("constellation 6 adds a Mega Radish's 7.5% heal at the skill Yuegui's third and sixth throws", () => {
    expect.hasAssertions();
    const constellation6 = createYaoyaoContext(0.5, {}, { constellationCount: 6 });
    const constellation5 = createYaoyaoContext(0.5, {}, { constellationCount: 5 });
    for (const context of [constellation6, constellation5]) YAOYAO_KIT.elementalSkill.onStart?.(context);
    const stepBoth = (frames: number): void => {
      stepFrames(constellation6, frames);
      stepFrames(constellation5, frames);
    };
    const healthGap = (): number =>
      getPartyMember(constellation6.party, YAOYAO_CHARACTER_ID).healthShare -
      getPartyMember(constellation5.party, YAOYAO_CHARACTER_ID).healthShare;

    // The third throw lands two throw intervals after the first, and its Mega Radish heals at its hitmark after it, as
    // The sixth throw, three intervals on, does at the same hitmark
    const thirdHealFrames =
      YUEGUI_SPAWN_FRAMES + YUEGUI_FIRST_THROW_FRAMES + 2 * YUEGUI_THROW_INTERVAL_FRAMES + MEGA_RADISH_HITMARK_FRAMES;
    const sixthHealFrames = thirdHealFrames + 3 * YUEGUI_THROW_INTERVAL_FRAMES;
    stepBoth(thirdHealFrames - 1);
    expect(healthGap()).toBe(0);
    stepBoth(1);
    expect(healthGap()).toBeCloseTo(0.075, 4);
    stepBoth(sixthHealFrames - thirdHealFrames - 1);
    expect(healthGap()).toBeCloseTo(0.075, 4);
    stepBoth(1);
    expect(healthGap()).toBeCloseTo(0.15, 4);
  });
});
