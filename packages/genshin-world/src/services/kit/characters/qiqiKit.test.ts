import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { QIQI_CHARACTER_ID, TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createQiqiKit } from "#src/services/kit/characters/qiqiKit";
import { computeEnemyStrikeDamage } from "#src/services/kit/computeEnemyStrikeDamage";
import { createKitEventContext } from "#src/services/kit/createKitEventContext.test";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const QIQI_KIT = createQiqiKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [QIQI_CHARACTER_ID]));

const createQiqiCombatant = (ascension = 0, constellationCount = 0): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([
    { attribute: Attribute.BaseHealth, value: 10_000 },
    { attribute: Attribute.BaseAttack, value: 1000 },
  ]),
  characterId: QIQI_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: QIQI_KIT,
  level: 90,
});

describe(createQiqiKit, () => {
  const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
  // The effects an action's start adds, as the kit's effects hold them
  const castEffects = (action: KitAction): KitEffect[] => {
    const kitEffectState: KitEffectState = { effects: [] };
    action.onStart?.({ body: kitBody, combatant: createQiqiCombatant(), kitEffectState });
    return kitEffectState.effects;
  };
  const castHerald = (): { field?: KitField; summon?: KitSummon } => {
    const effects = castEffects(QIQI_KIT.elementalSkill);
    return {
      field: effects.find((effect): effect is KitField => effect.kind === "field"),
      summon: effects.find((effect): effect is KitSummon => effect.kind === "summon"),
    };
  };

  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...QIQI_KIT.normalAttacks.flatMap((action) => action.hits.map((hit) => hit.talentMultiplier)),
      ...QIQI_KIT.chargedAttack.hits.map((hit) => hit.talentMultiplier),
      QIQI_KIT.plungeCollision.talentMultiplier,
      takeOne(QIQI_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(QIQI_KIT.highPlunge.hits).talentMultiplier,
      takeOne(QIQI_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.37754, 0.38872, 0.24166, 0.24166, 0.24682, 0.24682, 0.63038, 0.64328, 0.64328, 0.639324, 1.278377, 1.596762,
      2.848,
    ];
    expect(multipliers).toStrictEqual(expectedMultipliers);
  });

  test("the press's initial damage lands at 32 frames, and its swipes at the nine frames gcsim gives", () => {
    expect.hasAssertions();
    const { summon } = castHerald();
    const [initialHit, ...swipeHits] = summon?.hits ?? [];

    expect(summon?.isFollowing).toBe(true);
    expect(summon?.secondsRemaining).toBe(15);
    expect(initialHit?.hitmarkSeconds).toBeCloseTo(32 / 60);
    expect(initialHit?.talentMultiplier).toBeCloseTo(0.96);
    expect(swipeHits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))).toStrictEqual([
      96, 231, 291, 426, 486, 621, 681, 816, 876,
    ]);
    expect(swipeHits.every(({ talentMultiplier }) => talentMultiplier === 0.36)).toBe(true);
  });

  test("the regeneration ticks every 4.5 seconds from the press's hitmark, for the skill's 15 seconds", () => {
    expect.hasAssertions();
    const { field } = castHerald();

    expect(field?.nextTickSeconds).toBeCloseTo(32 / 60);
    expect(field?.radius).toBe(Number.POSITIVE_INFINITY);
    expect(field?.secondsRemaining).toBe(15);
    expect(field?.tickIntervalSeconds).toBe(4.5);
  });

  test("a normal or charged attack hit regenerates the party only while Herald of Frost stands", () => {
    expect.hasAssertions();
    const [hit] = takeOne(QIQI_KIT.normalAttacks).hits;
    const combatant = createQiqiCombatant();
    const { summon } = castHerald();
    const healParty = hit?.healParty;

    expect(healParty?.chance(combatant, [])).toBe(0);
    expect(healParty?.chance(combatant, summon ? [summon] : [])).toBe(1);
    expect(healParty?.isUnshielded).toBe(true);
    expect(healParty?.flatHealth).toBeCloseTo(67.40786);
    expect(healParty?.attackShare).toBeCloseTo(0.1056);
  });

  test("the plunges and the skill's damage carry no regeneration on hit", () => {
    expect.hasAssertions();

    expect(QIQI_KIT.lowPlunge.hits[0]?.healParty).toBeUndefined();
    expect(QIQI_KIT.highPlunge.hits[0]?.healParty).toBeUndefined();
    expect(QIQI_KIT.elementalSkill.hits).toStrictEqual([]);
  });

  test("the skill's cooldown, the burst's cooldown and energy cost come from the dump's groups", () => {
    expect.hasAssertions();

    expect(QIQI_KIT.skillCooldownSeconds).toBe(30);
    expect(QIQI_KIT.burstCooldownSeconds).toBe(20);
    expect(QIQI_KIT.burstEnergyCost).toBe(80);
    expect(QIQI_KIT.chargedAttackStamina).toBe(20);
  });

  // An enemy holding the Talisman the burst gives, as Qiqi stands
  const createTalismanEnemy = (combatant = createQiqiCombatant()) => {
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const talisman = takeOne(QIQI_KIT.elementalBurst.hits).enemyStatus?.(combatant);
    if (talisman) addEnemyStatus(enemy, talisman);
    return enemy;
  };
  const travelerCombatant: Combatant = { ...createQiqiCombatant(), characterId: TRAVELER_CHARACTER_ID };

  test("four constellations' Talisman cuts the enemy's strike by 20%", () => {
    expect.hasAssertions();
    const combatant = createQiqiCombatant();
    const strikeDamage = computeEnemyStrikeDamage(enemyTables, createTalismanEnemy(), combatant);
    const suppressedStrikeDamage = computeEnemyStrikeDamage(
      enemyTables,
      createTalismanEnemy(createQiqiCombatant(0, 4)),
      combatant,
    );

    expect(suppressedStrikeDamage / strikeDamage).toBeCloseTo(0.8);
  });

  test("damage the character on the field deals an enemy holding the Talisman heals it, once a second for each enemy", () => {
    expect.hasAssertions();
    const combatant = createQiqiCombatant();
    const enemy = createTalismanEnemy();
    const party = createParty([QIQI_CHARACTER_ID, TRAVELER_CHARACTER_ID]);
    const travelerMember = getPartyMember(party, TRAVELER_CHARACTER_ID);
    travelerMember.healthShare = 0.5;
    const takeDamage = (activeCombatant: Combatant): void =>
      QIQI_KIT.onKitEvent?.(
        {
          enemy,
          hit: takeOne(QIQI_KIT.normalAttacks[0]?.hits ?? []),
          isCritical: false,
          isDefeated: false,
          kind: KitEventKind.DamageTaken,
          striker: travelerCombatant,
        },
        createKitEventContext(combatant, { activeCombatant, party }),
      );
    takeDamage(combatant);

    expect(travelerMember.healthShare).toBe(0.5);

    takeDamage(travelerCombatant);
    takeDamage(travelerCombatant);

    expect(travelerMember.healthShare).toBeCloseTo(0.5 + (577.3388 + 0.9 * 1000) / 10_000);
  });

  test("ascension 4's Normal Attack hit gives the enemy a Talisman, once in 30 seconds", () => {
    expect.hasAssertions();
    const combatant = createQiqiCombatant(4);
    const context = createKitEventContext(combatant);
    const enemies = [
      createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
    ];
    for (const enemy of enemies)
      QIQI_KIT.onKitEvent?.(
        {
          attackTag: AttackTag.NormalAttack,
          enemy,
          hit: takeOne(QIQI_KIT.normalAttacks[0]?.hits ?? []),
          isCritical: false,
          isDefeated: false,
          kind: KitEventKind.DamageTaken,
          striker: combatant,
        },
        context,
      );

    expect(enemies.map(({ statuses }) => statuses.map(({ secondsRemaining }) => secondsRemaining))).toStrictEqual([
      [6],
      [],
    ]);
  });

  test("one constellation's Herald hit on an enemy holding the Talisman gives Qiqi 2 energy", () => {
    expect.hasAssertions();
    const combatant = createQiqiCombatant(0, 1);
    const context = createKitEventContext(combatant);
    const kitEffectState: KitEffectState = { effects: [] };
    QIQI_KIT.elementalSkill.onStart?.({ body: context.body, combatant, kitEffectState });
    const herald = kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");
    QIQI_KIT.onKitEvent?.(
      {
        enemy: createTalismanEnemy(),
        hit: takeOne(herald?.hits ?? []),
        isCritical: false,
        isDefeated: false,
        kind: KitEventKind.DamageTaken,
        striker: combatant,
      },
      context,
    );

    expect(getPartyMember(context.party, QIQI_CHARACTER_ID).energy).toBe(2);
  });

  test("two constellations raise her Normal and Charged Attack DMG by 15% against an enemy with Cryo on it", () => {
    expect.hasAssertions();
    const combatant = createQiqiCombatant(0, 2);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const party = createParty([QIQI_CHARACTER_ID]);
    const getDamageBonus = (attackTag: AttackTag): number | undefined =>
      QIQI_KIT.getStrikeDamageBonus?.(
        {
          attackTag,
          body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
          combatant,
          hit: QIQI_KIT.plungeCollision,
        },
        enemy,
        party,
      );

    expect(getDamageBonus(AttackTag.NormalAttack)).toBe(0);

    applyElement(enemy.elementalState, Element.Cryo, 1);

    expect(
      [AttackTag.NormalAttack, AttackTag.ChargedAttack, AttackTag.ElementalSkill].map((attackTag) =>
        getDamageBonus(attackTag),
      ),
    ).toStrictEqual([0.15, 0.15, 0]);
  });

  test("six constellations' burst revives the fallen at 50% of their Max HP, once in 15 minutes", () => {
    expect.hasAssertions();
    const combatant = createQiqiCombatant(0, 6);
    const party = createParty([QIQI_CHARACTER_ID, TRAVELER_CHARACTER_ID]);
    const travelerMember = getPartyMember(party, TRAVELER_CHARACTER_ID);
    const kitEffectState: KitEffectState = { effects: [] };
    const castBurst = (): void => {
      travelerMember.healthShare = 0;
      QIQI_KIT.elementalBurst.onStart?.({
        body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
        combatant,
        kitEffectState,
      });
      stepKitEffects(kitEffectState, 0.1, { activeCombatant: combatant, body: { x: 0, z: 0 }, party });
    };
    castBurst();

    expect(travelerMember.healthShare).toBe(0.5);

    castBurst();

    expect(travelerMember.healthShare).toBe(0);
  });
});
