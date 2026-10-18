import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitSummon } from "#src/models/kit/KitSummon";
import type { ReactionType } from "#src/models/combat/ReactionType";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import {
  createLaumaKitBehaviour,
  LAUMA_CHARACTER_ID,
  LAUMA_PALE_HYMN_BURST_ID,
  LAUMA_PALE_HYMN_MOON_SONG_ID,
} from "#src/services/kit/characters/laumaKit";
import { createKitBody } from "#src/services/kit/createKitBody";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { toKitSeconds } from "#src/services/kit/toKitSeconds";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const LAUMA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, LAUMA_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createCombatant = (elementalMastery: number, constellationCount = 0): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.ElementalMastery, value: elementalMastery }]),
  characterId: LAUMA_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: LAUMA_KIT,
  level: 90,
});

describe(createLaumaKitBehaviour, () => {
  // Hymn of Eternal Rest's Lunar-Bloom multiplier of her Elemental Mastery for each Dew, at talent level 1
  const LUNAR_BLOOM_MULTIPLIER = 1.52;

  test("reads the strikes', charged attack's, plunges' and press's multipliers from her proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...LAUMA_KIT.normalAttacks.map(({ hits }) => hits[0]?.talentMultiplier),
      LAUMA_KIT.chargedAttack.hits[0]?.talentMultiplier,
      LAUMA_KIT.plungeCollision.talentMultiplier,
      LAUMA_KIT.lowPlunge.hits[0]?.talentMultiplier,
      LAUMA_KIT.highPlunge.hits[0]?.talentMultiplier,
      LAUMA_KIT.elementalSkill.hits[0]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([0.337024, 0.318048, 0.444968, 1.2904, 0.568288, 1.136335, 1.419344, 1.216]);
  });

  test("her burst costs 60 energy and cools for 15 seconds, her skill cools for 12 seconds, and her charged attack costs no stamina", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: LAUMA_KIT.burstCooldownSeconds,
      burstEnergyCost: LAUMA_KIT.burstEnergyCost,
      chargedAttackStamina: LAUMA_KIT.chargedAttackStamina,
      skillCooldownSeconds: LAUMA_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 15,
      burstEnergyCost: 60,
      chargedAttackStamina: 0,
      skillCooldownSeconds: 12,
    });
  });

  test("her three strikes hit at their hitmarks and cancel at their default frames", () => {
    expect.hasAssertions();
    expect(
      LAUMA_KIT.normalAttacks.map(({ hits, seconds }) => ({
        hitmarkFrames: Math.round((hits[0]?.hitmarkSeconds ?? 0) * 60),
        seconds: Math.round(seconds * 60),
      })),
    ).toStrictEqual([
      { hitmarkFrames: 14, seconds: 29 },
      { hitmarkFrames: 11, seconds: 33 },
      { hitmarkFrames: 16, seconds: 38 },
    ]);
  });

  test("the charged attack, Spiritcall Prayer, hits at 73 frames, after its 68-frame animation", () => {
    expect.hasAssertions();
    expect({
      hitmarkFrames: Math.round((LAUMA_KIT.chargedAttack.hits[0]?.hitmarkSeconds ?? 0) * 60),
      seconds: Math.round(LAUMA_KIT.chargedAttack.seconds * 60),
    }).toStrictEqual({ hitmarkFrames: 73, seconds: 68 });
  });

  test("the press of Hymn of Hunting hits at 16 frames, and its hold plays Hymn of Eternal Rest only while the party holds Verdant Dew", () => {
    expect.hasAssertions();

    const hold = takeOne(LAUMA_KIT.elementalSkillHolds ?? [], 0);
    const context = createKitTestContext(createCombatant(0));
    const isActiveWithoutDew = hold.variant?.checkIsActive(context);
    context.party.verdantDew.count = 1;

    expect({
      holdHitmarkFrames: Math.round((hold.variant?.action.hits[0]?.hitmarkSeconds ?? 0) * 60),
      holdSeconds: Math.round((hold.variant?.action.seconds ?? 0) * 60),
      isActiveWithDew: hold.variant?.checkIsActive(context),
      isActiveWithoutDew,
      pressHitmarkFrames: Math.round((LAUMA_KIT.elementalSkill.hits[0]?.hitmarkSeconds ?? 0) * 60),
    }).toStrictEqual({
      holdHitmarkFrames: 45,
      holdSeconds: 64,
      isActiveWithDew: true,
      isActiveWithoutDew: false,
      pressHitmarkFrames: 16,
    });
  });

  test("spends up to three Dew with Hymn of Eternal Rest on a Lunar-Bloom hit of its multiplier for each, beside the sanctuary", () => {
    expect.hasAssertions();

    const holdAction = takeOne(LAUMA_KIT.elementalSkillHolds ?? [], 0).variant?.action;
    const context = createKitTestContext(createCombatant(0));
    context.party.verdantDew.count = 2;
    holdAction?.onStart?.(context);
    const lunarHits = context.kitEffectState.effects.flatMap((effect) =>
      effect.kind === "summon" ? effect.hits.filter(({ lunarHit }) => lunarHit) : [],
    );

    expect({
      dewCount: context.party.verdantDew.count,
      lunarHitMultipliers: lunarHits.map(({ talentMultiplier }) => talentMultiplier),
      summonCount: context.kitEffectState.effects.filter(({ kind }) => kind === "summon").length,
    }).toStrictEqual({
      dewCount: 0,
      lunarHitMultipliers: [expect.closeTo(2 * LUNAR_BLOOM_MULTIPLIER)],
      summonCount: 2,
    });
  });

  test("her Moonsign Benediction turns Bloom Lunar, with 0.0175% Base DMG Bonus a point of Elemental Mastery, at most 14%", () => {
    expect.hasAssertions();

    const benediction = LAUMA_KIT.moonsignBenediction;

    expect({
      baseDamageBonuses: [400, 1000].map((elementalMastery) =>
        benediction?.getBaseDamageBonus?.(createCombatant(elementalMastery)),
      ),
      lunarReactionTypes: benediction?.lunarReactionTypes,
    }).toStrictEqual({
      baseDamageBonuses: [expect.closeTo(0.07), 0.14],
      lunarReactionTypes: [LunarReactionType.LunarBloom],
    });
  });
});

// The Elemental Skill DMG Bonus Cleansing for the Spring gives a hit of hers, with her at the given ascension and Elemental
// Mastery
const readSkillDamageBonus = (ascension: number, elementalMastery: number): number => {
  const combatant = { ...createCombatant(elementalMastery), ascension };
  return (
    LAUMA_KIT.getStrikeDamageBonus?.(
      {
        attackTag: AttackTag.ElementalSkill,
        body: createKitBody({ x: 0, z: 0 }),
        combatant,
        hit: takeOne(LAUMA_KIT.elementalSkill.hits),
      },
      createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      createParty([LAUMA_CHARACTER_ID]),
      [],
    ) ?? 0
  );
};

describe("cleansing for the Spring", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect([readSkillDamageBonus(4, 500), readSkillDamageBonus(4, 1000)]).toStrictEqual([0.0004 * 500, 0.32]);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(readSkillDamageBonus(3, 1000)).toBe(0);
  });

  test("the Frostgrove Sanctuary's ticks strike as her Elemental Skill, so the bonus reaches them", () => {
    expect.hasAssertions();
    const context = createKitTestContext({ ...createCombatant(500), ascension: 4 });
    LAUMA_KIT.elementalSkill.onStart?.(context);
    const sanctuary = takeOne(
      context.kitEffectState.effects.filter((effect): effect is KitSummon => effect.kind === "summon"),
    );

    expect(sanctuary.attackTag).toBe(AttackTag.ElementalSkill);
  });
});

// The kit seconds stepped through the team's effects, each one that runs out emitted to the kits as it is in play
const stepLaumaSeconds = (context: KitContext, seconds: number): void => {
  for (let stepIndex = 0; stepIndex < Math.round(seconds / FIXED_STEP_SECONDS); stepIndex++) {
    stepKitEffects(FIXED_STEP_SECONDS, context);
    for (const effect of context.expiredEffects) emitKitEvent({ effect, kind: KitEventKind.EffectExpired }, context);
  }
};

const countPaleHymn = (context: KitContext, id: string): number =>
  countKitResource(context.kitEffectState.effects, LAUMA_CHARACTER_ID, id);

// Hymn of Eternal Rest's hold, which spends the party's Dew as it starts
const castEternalRest = (context: KitContext): void => {
  takeOne(LAUMA_KIT.elementalSkillHolds ?? [], 0).variant?.action.onStart?.(context);
};

// A reaction of the given kind triggered on an enemy by the active combatant
const triggerReaction = (context: KitContext, reactionType: ReactionType): void => {
  emitKitEvent(
    {
      enemy: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      kind: KitEventKind.ReactionTriggered,
      reactions: [{ reactionType }],
      striker: context.activeCombatant,
    },
    context,
  );
};

describe("pale hymn", () => {
  test("her burst gives the team 18 Pale Hymn 96 frames after it starts, which last 15 seconds", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createCombatant(0));
    LAUMA_KIT.elementalBurst.onStart?.(context);

    stepLaumaSeconds(context, toKitSeconds(95));
    const beforeGain = countPaleHymn(context, LAUMA_PALE_HYMN_BURST_ID);
    stepLaumaSeconds(context, toKitSeconds(1));
    const atGain = countPaleHymn(context, LAUMA_PALE_HYMN_BURST_ID);
    stepLaumaSeconds(context, 14);
    const during = countPaleHymn(context, LAUMA_PALE_HYMN_BURST_ID);
    stepLaumaSeconds(context, 2);
    const after = countPaleHymn(context, LAUMA_PALE_HYMN_BURST_ID);

    expect({ after, atGain, beforeGain, during }).toStrictEqual({ after: 0, atGain: 18, beforeGain: 0, during: 18 });
  });

  test("dew spent by Hymn of Eternal Rest during her burst gives Moon Song six Pale Hymn a Dew, once in each burst", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createCombatant(0));
    LAUMA_KIT.elementalBurst.onStart?.(context);
    stepLaumaSeconds(context, toKitSeconds(96));

    context.party.verdantDew.count = 2;
    castEternalRest(context);
    const firstMoonSong = countPaleHymn(context, LAUMA_PALE_HYMN_MOON_SONG_ID);
    context.party.verdantDew.count = 1;
    castEternalRest(context);

    expect({ firstMoonSong, secondMoonSong: countPaleHymn(context, LAUMA_PALE_HYMN_MOON_SONG_ID) }).toStrictEqual({
      firstMoonSong: 12,
      secondMoonSong: 12,
    });
  });

  test("dew spent before her burst waits for it, and gives Moon Song six Pale Hymn a Dew when the burst gains its own", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createCombatant(0));
    context.party.verdantDew.count = 1;
    castEternalRest(context);
    const beforeBurst = countPaleHymn(context, LAUMA_PALE_HYMN_MOON_SONG_ID);

    LAUMA_KIT.elementalBurst.onStart?.(context);
    stepLaumaSeconds(context, toKitSeconds(96));

    expect({ beforeBurst, moonSong: countPaleHymn(context, LAUMA_PALE_HYMN_MOON_SONG_ID) }).toStrictEqual({
      beforeBurst: 0,
      moonSong: 6,
    });
  });

  test("a Bloom or Lunar-Bloom reaction spends a Pale Hymn, Moon Song's first, and a reaction of another kind spends none", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createCombatant(0));
    LAUMA_KIT.elementalBurst.onStart?.(context);
    stepLaumaSeconds(context, toKitSeconds(96));
    context.party.verdantDew.count = 1;
    castEternalRest(context);
    const snapshot = () => ({
      burst: countPaleHymn(context, LAUMA_PALE_HYMN_BURST_ID),
      moonSong: countPaleHymn(context, LAUMA_PALE_HYMN_MOON_SONG_ID),
    });

    triggerReaction(context, TransformativeReactionType.Overloaded);
    const afterOverloaded = snapshot();
    triggerReaction(context, TransformativeReactionType.Bloom);
    triggerReaction(context, LunarReactionType.LunarBloom);
    const afterBloomAndLunarBloom = snapshot();
    for (let reactionIndex = 0; reactionIndex < 4; reactionIndex++)
      triggerReaction(context, TransformativeReactionType.Bloom);
    const afterMoonSongIsSpent = snapshot();
    triggerReaction(context, TransformativeReactionType.Bloom);

    expect({ afterBloomAndLunarBloom, afterMoonSongIsSpent, afterOneMore: snapshot(), afterOverloaded }).toStrictEqual({
      afterBloomAndLunarBloom: { burst: 18, moonSong: 4 },
      afterMoonSongIsSpent: { burst: 18, moonSong: 0 },
      afterOneMore: { burst: 17, moonSong: 0 },
      afterOverloaded: { burst: 18, moonSong: 6 },
    });
  });
});

// Lauma's Pale Hymn Bloom and Lunar-Bloom increases of her Elemental Mastery at her burst's talent level 1, from gcsim
// (MIT) lauma/burst.go and the burst's proud skill group
const BLOOM_INCREASE = 2.7776;
const LUNAR_BLOOM_INCREASE = 2.2224;
// Constellation 2's extra Elemental Mastery ratio for each Bloom and each Lunar-Bloom, as gcsim v2.47.2 (MIT) lauma/cons.go gives them
const C2_BLOOM_INCREASE = 5;
const C2_LUNAR_BLOOM_INCREASE = 4;

// The base damage Pale Hymn adds to a reaction of the given kind, with Lauma at the given Elemental Mastery and the
// Party's effects as given
const readPaleHymnBaseDamageBonus = (
  elementalMastery: number,
  reactionType: ReactionType,
  kitEffectState: KitEffectState,
  constellationCount = 0,
): number => {
  const combatant = createCombatant(elementalMastery, constellationCount);
  return (
    LAUMA_KIT.getPartyReactionBonus?.(
      combatant,
      { combatant, element: Element.Dendro, enemy: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""), reactionType },
      createKitTestContext(combatant, { kitEffectState }),
    )?.additiveBaseDamageBonus ?? 0
  );
};

describe("pale hymn's base damage bonus", () => {
  test("adds her Elemental Mastery times the Bloom increase to each Bloom, Hyperbloom and Burgeon while the party holds Pale Hymn", () => {
    expect.hasAssertions();
    const kitEffectState = { effects: [] };
    addKitStatus(kitEffectState, LAUMA_CHARACTER_ID, {
      id: LAUMA_PALE_HYMN_BURST_ID,
      secondsRemaining: 15,
      stacks: 18,
    });

    expect(
      [TransformativeReactionType.Bloom, TransformativeReactionType.Hyperbloom, TransformativeReactionType.Burgeon].map(
        (reactionType) => readPaleHymnBaseDamageBonus(1000, reactionType, kitEffectState),
      ),
    ).toStrictEqual([
      expect.closeTo(1000 * BLOOM_INCREASE),
      expect.closeTo(1000 * BLOOM_INCREASE),
      expect.closeTo(1000 * BLOOM_INCREASE),
    ]);
  });

  test("adds her Elemental Mastery times the Lunar-Bloom increase to each Lunar-Bloom while the party holds Pale Hymn", () => {
    expect.hasAssertions();
    const kitEffectState = { effects: [] };
    addKitStatus(kitEffectState, LAUMA_CHARACTER_ID, {
      id: LAUMA_PALE_HYMN_BURST_ID,
      secondsRemaining: 15,
      stacks: 18,
    });

    expect(readPaleHymnBaseDamageBonus(1000, LunarReactionType.LunarBloom, kitEffectState)).toBeCloseTo(
      1000 * LUNAR_BLOOM_INCREASE,
    );
  });

  test("adds nothing while the party holds no Pale Hymn, and nothing to a reaction that is not Bloom", () => {
    expect.hasAssertions();
    const kitEffectState = { effects: [] };
    const withoutPaleHymn = readPaleHymnBaseDamageBonus(1000, TransformativeReactionType.Bloom, kitEffectState);
    addKitStatus(kitEffectState, LAUMA_CHARACTER_ID, {
      id: LAUMA_PALE_HYMN_BURST_ID,
      secondsRemaining: 15,
      stacks: 18,
    });

    expect({
      otherReaction: readPaleHymnBaseDamageBonus(1000, TransformativeReactionType.Overloaded, kitEffectState),
      withoutPaleHymn,
    }).toStrictEqual({ otherReaction: 0, withoutPaleHymn: 0 });
  });

  test("holds the bonus from Moon Song's Pale Hymn alone, once the burst's is spent", () => {
    expect.hasAssertions();
    const kitEffectState = { effects: [] };
    addKitStatus(kitEffectState, LAUMA_CHARACTER_ID, {
      id: LAUMA_PALE_HYMN_MOON_SONG_ID,
      secondsRemaining: 15,
      stacks: 6,
    });

    expect(readPaleHymnBaseDamageBonus(1000, TransformativeReactionType.Bloom, kitEffectState)).toBeCloseTo(
      1000 * BLOOM_INCREASE,
    );
  });

  test("adds 5 more Elemental Mastery to each Bloom from Constellation 2, and none from Constellation 1", () => {
    expect.hasAssertions();
    const kitEffectState = { effects: [] };
    addKitStatus(kitEffectState, LAUMA_CHARACTER_ID, {
      id: LAUMA_PALE_HYMN_BURST_ID,
      secondsRemaining: 15,
      stacks: 18,
    });

    expect({
      constellation1: readPaleHymnBaseDamageBonus(1000, TransformativeReactionType.Bloom, kitEffectState, 1),
      constellation2: readPaleHymnBaseDamageBonus(1000, TransformativeReactionType.Bloom, kitEffectState, 2),
    }).toStrictEqual({
      constellation1: expect.closeTo(1000 * BLOOM_INCREASE),
      constellation2: expect.closeTo(1000 * (BLOOM_INCREASE + C2_BLOOM_INCREASE)),
    });
  });

  test("adds 4 more Elemental Mastery to each Lunar-Bloom from Constellation 2", () => {
    expect.hasAssertions();
    const kitEffectState = { effects: [] };
    addKitStatus(kitEffectState, LAUMA_CHARACTER_ID, {
      id: LAUMA_PALE_HYMN_BURST_ID,
      secondsRemaining: 15,
      stacks: 18,
    });

    expect(readPaleHymnBaseDamageBonus(1000, LunarReactionType.LunarBloom, kitEffectState, 2)).toBeCloseTo(
      1000 * (LUNAR_BLOOM_INCREASE + C2_LUNAR_BLOOM_INCREASE),
    );
  });
});
