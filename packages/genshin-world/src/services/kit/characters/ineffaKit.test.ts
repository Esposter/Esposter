import type { Reaction } from "#src/models/combat/Reaction";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitShield } from "#src/models/kit/KitShield";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { KitSummon } from "#src/models/kit/KitSummon";
import type { Enemy } from "#src/models/enemy/Enemy";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createIneffaKitBehaviour, INEFFA_CHARACTER_ID } from "#src/services/kit/characters/ineffaKit";
import { castKitAction, createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { strikeKitEnemies } from "#src/services/kit/strikeKitEnemies";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const INEFFA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, INEFFA_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createIneffaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseDefense, value: 1000 }]),
  characterId: INEFFA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: INEFFA_KIT,
  level: 90,
  weaponType: WeaponType.Polearm,
});

// The energy Ineffa holds after the same reactions land on her party the given number of times
const readEnergyAfterReactions = (constellationCount: number, reactions: Reaction[], times: number): number => {
  const combatant = { ...createIneffaCombatant(), constellationCount };
  const party = createParty([INEFFA_CHARACTER_ID]);
  const event = {
    enemy: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
    kind: KitEventKind.ReactionTriggered as const,
    reactions,
    striker: combatant,
  };
  const context = createKitTestContext(combatant, { party });
  for (let index = 0; index < times; index++) INEFFA_KIT.onKitEvent?.(event, context, combatant);
  return party.characterIdMemberMap.get(INEFFA_CHARACTER_ID)?.energy ?? 0;
};

// Steps Ineffa's kit for the frames given, emitting each enemy hit at its frame, and returns each frame on which a Lunar
// Hit is queued, once for each hit queued on it
const readLunarHitFrames = (
  combatant: Combatant,
  enemies: Enemy[],
  frames: number,
  enemyHits: Map<number, { attackTag: AttackTag; enemy: Enemy }>,
): number[] => {
  const context = createKitTestContext(combatant, {
    enemyMap: new Map(enemies.map((enemy, index) => [String(index), enemy])),
    enemyTables,
    party: createParty([INEFFA_CHARACTER_ID]),
  });
  const queuedFrames: number[] = [];
  for (let frame = 1; frame <= frames; frame++) {
    stepKitEffects(1 / 60, context);
    const enemyHit = enemyHits.get(frame);
    if (enemyHit)
      emitKitEvent(
        {
          attackTag: enemyHit.attackTag,
          element: Element.Electro,
          enemy: enemyHit.enemy,
          kind: KitEventKind.EnemyHit,
          striker: combatant,
        },
        context,
      );
    for (const { hit } of context.strikes) if (hit.lunarHit) queuedFrames.push(frame);
  }
  return queuedFrames;
};

// The shields Ineffa's burst holds after the frames given, as its cast starts
const readBurstShieldsAfter = (frames: number): KitShield[] => {
  const combatant = { ...createIneffaCombatant(), constellationCount: 2 };
  const kitEffectState = castKitAction(INEFFA_KIT.elementalBurst, combatant);
  const context = createKitTestContext(combatant, { enemyTables, kitEffectState });
  for (let frame = 0; frame < frames; frame++) stepKitEffects(1 / 60, context);
  return kitEffectState.effects.filter((effect): effect is KitShield => effect.kind === "shield");
};

// Casts Ineffa's skill with an enemy at her feet, steps the kit by the frames given and lands every strike as it comes,
// Then reads the energy her party holds
const readEnergyAfterSkill = (random: () => number, frames: number): number => {
  const combatant: Combatant = {
    ...createIneffaCombatant(),
    attributes: computeCharacterAttributes([
      { attribute: Attribute.BaseDefense, value: 1000 },
      { attribute: Attribute.EnergyRecharge, value: 1 },
    ]),
    element: Element.Electro,
  };
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  enemy.health = 1_000_000_000;
  const party = createParty([INEFFA_CHARACTER_ID]);
  const kitEffectState = castKitAction(INEFFA_KIT.elementalSkill, combatant);
  const context = createKitTestContext(combatant, {
    enemyMap: new Map([["1", enemy]]),
    enemyTables,
    kitEffectState,
    party,
    random,
  });
  for (let frame = 0; frame < frames; frame++) {
    stepKitEffects(1 / 60, context);
    if (context.strikes.length > 0) strikeKitEnemies(context.strikes, context);
    for (const effect of context.expiredEffects) emitKitEvent({ effect, kind: KitEventKind.EffectExpired }, context);
  }
  return party.characterIdMemberMap.get(INEFFA_CHARACTER_ID)?.energy ?? 0;
};

describe(createIneffaKitBehaviour, () => {
  const BIRGITTA_ID = "birgitta";
  const castBirgitta = (action: KitAction, effects: KitEffect[] = []): KitSummon =>
    takeOne(
      castKitAction(action, createIneffaCombatant(), { effects }).effects.filter(
        (effect): effect is KitSummon => effect.kind === "summon" && effect.id === BIRGITTA_ID,
      ),
    );

  test("reads each talent multiplier from her proud skill groups, to four decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...INEFFA_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...INEFFA_KIT.chargedAttack.hits.map((hit) => hit.talentMultiplier),
      INEFFA_KIT.plungeCollision.talentMultiplier,
      takeOne(INEFFA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(INEFFA_KIT.highPlunge.hits).talentMultiplier,
      takeOne(INEFFA_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(INEFFA_KIT.elementalBurst.hits).talentMultiplier,
    ].map((multiplier) => Number(multiplier.toFixed(4)));

    expect(multipliers).toStrictEqual([0.3484, 0.3422, 0.2276, 0.5607, 0.9494, 0.6393, 1.2784, 1.5968, 0.864, 6.768]);
  });

  test("reads her stamina, her cooldowns and her burst's energy cost from her proud skill groups", () => {
    expect.hasAssertions();
    expect([
      INEFFA_KIT.chargedAttackStamina,
      INEFFA_KIT.skillCooldownSeconds,
      INEFFA_KIT.burstCooldownSeconds,
      INEFFA_KIT.burstEnergyCost,
    ]).toStrictEqual([25, 16, 15, 60]);
  });

  test("lands her strikes at their hitmarks, her charged attack at 23 frames, her skill at 26, and her burst at 111", () => {
    expect.hasAssertions();
    expect({
      burstHitmarkFrames: INEFFA_KIT.elementalBurst.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
      chargedAttackHitmarkFrames: INEFFA_KIT.chargedAttack.hits.map(({ hitmarkSeconds }) =>
        Math.round(hitmarkSeconds * 60),
      ),
      normalAttackHitmarkFrames: INEFFA_KIT.normalAttacks.map(({ hits }) =>
        Math.round(takeOne(hits).hitmarkSeconds * 60),
      ),
      skillHitmarkFrames: INEFFA_KIT.elementalSkill.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
    }).toStrictEqual({
      burstHitmarkFrames: [111],
      chargedAttackHitmarkFrames: [23],
      normalAttackHitmarkFrames: [9, 17, 10, 27],
      skillHitmarkFrames: [26],
    });
  });

  test("her skill summons Birgitta at 68 frames, who stands 1,200 frames and discharges 42 frames in and every 119 after", () => {
    expect.hasAssertions();
    const birgitta = castBirgitta(INEFFA_KIT.elementalSkill);

    expect(birgitta.spawnSeconds).toBeCloseTo(68 / 60);
    expect(birgitta.secondsRemaining).toBeCloseTo((68 + 1200) / 60);
    expect(birgitta.hits).toHaveLength(10);
    expect(birgitta.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)).slice(0, 2)).toStrictEqual([
      110, 229,
    ]);
  });

  test("her burst summons Birgitta again and ends the one on the field, as gcsim restarts her discharges", () => {
    expect.hasAssertions();
    const skillBirgitta = castBirgitta(INEFFA_KIT.elementalSkill);
    const birgittas = castKitAction(INEFFA_KIT.elementalBurst, createIneffaCombatant(), {
      effects: [skillBirgitta],
    }).effects.filter((effect): effect is KitSummon => effect.kind === "summon" && effect.id === BIRGITTA_ID);

    expect(skillBirgitta.secondsRemaining).toBe(0);
    expect(birgittas.map(({ spawnSeconds }) => Math.round((spawnSeconds ?? 0) * 60))).toStrictEqual([68, 111]);
  });

  test("her skill places a shield 4 frames in, priced by her ATK and the table's flat HP, for 20 seconds", () => {
    expect.hasAssertions();
    const combatant = createIneffaCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(combatant, { kitEffectState });
    INEFFA_KIT.elementalSkill.onStart?.(context);
    const field = takeOne(kitEffectState.effects.filter((effect): effect is KitField => effect.kind === "field"));
    expect(field.nextTickSeconds).toBeCloseTo(4 / 60);

    field.onTick(context, 0);
    const shield = takeOne(kitEffectState.effects.filter((effect): effect is KitShield => effect.kind === "shield"));
    expect(shield.health).toBeCloseTo(2.21184 * combatant.attributes.attack + 1386.6759);
    expect(shield.secondsRemaining).toBe(20);
  });

  test("a Birgitta discharge that lands drops an Electro particle 100 frames later, when its roll is under two in three", () => {
    expect.hasAssertions();

    // Her first discharge lands at 110 frames, so its particle is not in yet at 209 and is by 212
    expect([readEnergyAfterSkill(() => 0, 209), readEnergyAfterSkill(() => 0, 212)]).toStrictEqual([0, 3]);
  });

  test("a Birgitta discharge whose roll is two in three or more drops no particle", () => {
    expect.hasAssertions();

    expect(readEnergyAfterSkill(() => 0.66, 400)).toBe(0);
  });

  test("a constellation 2 burst places its shield 37 frames in, as an Electro shield", () => {
    expect.hasAssertions();

    expect([readBurstShieldsAfter(36), readBurstShieldsAfter(37).map(({ element }) => element)]).toStrictEqual([
      [],
      [Element.Electro],
    ]);
  });

  test("the first enemy a constellation 2 burst hits takes a Lunar-Charged Punishment Edit 60 frames later", () => {
    expect.hasAssertions();

    const combatant = { ...createIneffaCombatant(), constellationCount: 2 };
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

    expect(
      readLunarHitFrames(combatant, [enemy], 80, new Map([[10, { attackTag: AttackTag.ElementalBurst, enemy }]])),
    ).toStrictEqual([70]);
  });

  test("the Punishment Edit comes at the marked enemy's next hit when that is sooner than 60 frames", () => {
    expect.hasAssertions();

    const combatant = { ...createIneffaCombatant(), constellationCount: 2 };
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

    expect(
      readLunarHitFrames(
        combatant,
        [enemy],
        80,
        new Map([
          [10, { attackTag: AttackTag.ElementalBurst, enemy }],
          [25, { attackTag: AttackTag.ElementalSkill, enemy }],
        ]),
      ),
    ).toStrictEqual([25]);
  });

  test("a constellation 2 burst marks only the first enemy it hits", () => {
    expect.hasAssertions();

    const combatant = { ...createIneffaCombatant(), constellationCount: 2 };
    const [first, second] = [
      createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
    ];

    expect(
      readLunarHitFrames(
        combatant,
        [first, second],
        80,
        new Map([
          [10, { attackTag: AttackTag.ElementalBurst, enemy: first }],
          [11, { attackTag: AttackTag.ElementalBurst, enemy: second }],
        ]),
      ),
    ).toStrictEqual([70]);
  });

  test("her Moonsign Benediction turns Electro-Charged Lunar, with 0.7% Base DMG Bonus each 100 ATK, at most 14%", () => {
    expect.hasAssertions();

    const benediction = INEFFA_KIT.moonsignBenediction;
    const baseDamageBonuses = [1000, 3000].map((baseAttack) =>
      benediction?.getBaseDamageBonus?.({
        ...createIneffaCombatant(),
        attributes: computeCharacterAttributes([{ attribute: Attribute.BaseAttack, value: baseAttack }]),
      }),
    );

    expect({ baseDamageBonuses, lunarReactionTypes: benediction?.lunarReactionTypes }).toStrictEqual({
      baseDamageBonuses: [expect.closeTo(0.07), 0.14],
      lunarReactionTypes: [LunarReactionType.LunarCharged],
    });
  });

  test("a constellation 4 Lunar-Charged reaction restores 5 energy to Ineffa once, until its cooldown ends", () => {
    expect.hasAssertions();

    expect(readEnergyAfterReactions(4, [{ reactionType: LunarReactionType.LunarCharged }], 3)).toBe(5);
  });

  test("a constellation 3 Lunar-Charged reaction restores no energy to Ineffa", () => {
    expect.hasAssertions();

    expect(readEnergyAfterReactions(3, [{ reactionType: LunarReactionType.LunarCharged }], 1)).toBe(0);
  });

  test("a constellation 4 reaction that is not Lunar restores no energy to Ineffa", () => {
    expect.hasAssertions();

    expect(
      readEnergyAfterReactions(4, [{ element: Element.Electro, reactionType: ReactionType.Superconduct }], 1),
    ).toBe(0);
  });
});

describe("panoramic Permutation Protocol", () => {
  const PERMUTATION_SOURCE = "ineffa-permutation";
  const OTHER_CHARACTER_ID = 10_000_001;

  // Supreme Instruction: Cyclonic Exterminator with Ineffa at the given ascension and attack, and the buffs it leaves
  const castBurstBuffs = (ascension: number, attack: number): KitBuff[] => {
    const combatant = {
      ...createIneffaCombatant(),
      ascension,
      attributes: computeCharacterAttributes([{ attribute: Attribute.Attack, value: attack }]),
    };
    const kitEffectState: KitEffectState = { effects: [] };
    INEFFA_KIT.elementalBurst.onStart?.(createKitTestContext(combatant, { kitEffectState }));
    return kitEffectState.effects.filter(
      (effect): effect is KitBuff => effect.kind === "buff" && effect.source === PERMUTATION_SOURCE,
    );
  };

  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(castBurstBuffs(4, 1000)).toStrictEqual([
      {
        amount: 0.06 * 1000,
        attribute: Attribute.ElementalMastery,
        characterId: INEFFA_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 20,
        source: PERMUTATION_SOURCE,
      },
    ]);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(castBurstBuffs(3, 1000)).toStrictEqual([]);
  });

  test("the permutation moves to the active member on a swap and leaves the one it left", () => {
    expect.hasAssertions();

    const combatant = {
      ...createIneffaCombatant(),
      ascension: 4,
      attributes: computeCharacterAttributes([{ attribute: Attribute.Attack, value: 1000 }]),
    };
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(combatant, { kitEffectState });
    INEFFA_KIT.elementalBurst.onStart?.(context);
    const swapTo = (characterId: number, previousCharacterId: number) =>
      INEFFA_KIT.onKitEvent?.(
        { characterId, kind: KitEventKind.CharacterSwapped, previousCharacterId },
        context,
        combatant,
      );
    const holders = (): number[] =>
      kitEffectState.effects.flatMap((effect) =>
        effect.kind === "buff" && effect.source === PERMUTATION_SOURCE ? [effect.characterId] : [],
      );

    swapTo(OTHER_CHARACTER_ID, INEFFA_CHARACTER_ID);
    expect(holders()).toStrictEqual([INEFFA_CHARACTER_ID, OTHER_CHARACTER_ID]);

    swapTo(INEFFA_CHARACTER_ID, OTHER_CHARACTER_ID);
    expect(holders()).toStrictEqual([INEFFA_CHARACTER_ID]);
  });
});

// Casts Ineffa's skill, steps its kit for the frames given and returns each strike that is a Lunar-Charged hit with the
// Frame it is queued on, counted in steps as the Punishment Edit's helper counts them. A Lunar-Charged reaction, if it is
// Asked for, is triggered before the first step
const readA1Strikes = (combatant: Combatant, frames: number, hasLunarCharged = false) => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const context = createKitTestContext(combatant, {
    enemyMap: new Map([["1", enemy]]),
    enemyTables,
    kitEffectState: castKitAction(INEFFA_KIT.elementalSkill, combatant),
    party: createParty([INEFFA_CHARACTER_ID]),
    primaryTarget: enemy,
  });
  if (hasLunarCharged)
    emitKitEvent(
      {
        enemy,
        kind: KitEventKind.ReactionTriggered,
        reactions: [{ reactionType: LunarReactionType.LunarCharged }],
        striker: combatant,
      },
      context,
    );
  const queued: { frame: number; strike: KitStrike }[] = [];
  for (let frame = 1; frame <= frames; frame++) {
    stepKitEffects(1 / 60, context);
    for (const strike of context.strikes) if (strike.hit.lunarHit) queued.push({ frame, strike });
  }
  return queued;
};

describe("birgitta's Ascension 1 Lunar-Charged hit", () => {
  test("a Birgitta discharge queues a Lunar-Charged hit 38 frames on, while a Lunar-Charged reaction holds for 5.5 seconds", () => {
    expect.hasAssertions();

    expect(
      readA1Strikes({ ...createIneffaCombatant(), ascension: 1 }, 400, true).map(({ frame }) => frame),
    ).toStrictEqual([148, 267]);
  });

  test("a Birgitta discharge queues no Lunar-Charged hit with no Lunar-Charged reaction in the last 5.5 seconds", () => {
    expect.hasAssertions();

    expect(readA1Strikes({ ...createIneffaCombatant(), ascension: 1 }, 400)).toStrictEqual([]);
  });

  test("below Ascension 1, a Birgitta discharge queues no Lunar-Charged hit", () => {
    expect.hasAssertions();

    expect(readA1Strikes({ ...createIneffaCombatant(), ascension: 0 }, 400, true)).toStrictEqual([]);
  });

  test("the Lunar-Charged hit is Electro at 0.65 of her ATK, ignores all of the enemy's DEF, and reaches the primary target's circle of radius 4", () => {
    expect.hasAssertions();

    const [queued] = readA1Strikes({ ...createIneffaCombatant(), ascension: 1 }, 150, true);
    const hit = queued?.strike.hit;
    expect([hit?.defenseIgnored, hit?.element, hit?.lunarHit, hit?.talentMultiplier]).toStrictEqual([
      1,
      Element.Electro,
      { lunarReactionType: LunarReactionType.LunarCharged },
      0.65,
    ]);
    expect(queued?.strike.hitbox).toStrictEqual({ offset: { x: 0, z: 0 }, shape: { kind: "circle", radius: 4 } });
  });
});
