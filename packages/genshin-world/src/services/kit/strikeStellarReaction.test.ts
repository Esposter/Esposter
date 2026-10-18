import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { Element } from "#src/models/Element";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { CharacterLevelMultiplierMap } from "#src/services/combat/damage/CharacterLevelMultiplierMap";
import { LUNAR_CONTRIBUTION_WEIGHTS, STELLAR_SWIRL_ANEMO_COEFFICIENT } from "#src/services/combat/damage/constants";
import { getResistanceMultiplier } from "#src/services/combat/damage/getResistanceMultiplier";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getEnemyResistance } from "#src/services/enemy/getEnemyResistance";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { strikeStellarReaction } from "#src/services/kit/strikeStellarReaction";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const LEVEL = 90;
const STURDY_HEALTH = 1e9;
// Sturdy, so a hit is not clamped to the health the camp member starts with
const createSturdyEnemy = () => ({
  ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
  health: STURDY_HEALTH,
  maxHealth: STURDY_HEALTH,
});

describe(strikeStellarReaction, () => {
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: LEVEL,
  };
  const kind = getEnemyKind(enemyTables.enemyKindMap, ENEMY_CAMP_MEMBER.enemyKindId);
  // The damage of a Stellar Swirl the creator makes on a fresh enemy, its one contributor
  const damageOfStellarSwirl = (creator: Combatant): number => {
    const enemy = createSturdyEnemy();
    strikeStellarReaction(
      enemy,
      Element.Anemo,
      STELLAR_SWIRL_ANEMO_COEFFICIENT,
      new Set([TRAVELER_CHARACTER_ID]),
      creator,
      createKitTestContext(creator, { enemyTables }),
      StellarReactionType.StellarSwirl,
    );
    return enemy.maxHealth - enemy.health;
  };

  test("a Stellar reaction on an enemy already Dead strikes nothing", () => {
    expect.hasAssertions();
    const enemy = { ...createSturdyEnemy(), health: 0, state: EnemyState.Dead };
    const context = createKitTestContext(combatant, { enemyTables });

    expect(
      strikeStellarReaction(
        enemy,
        Element.Anemo,
        STELLAR_SWIRL_ANEMO_COEFFICIENT,
        new Set([TRAVELER_CHARACTER_ID]),
        combatant,
        context,
        StellarReactionType.StellarSwirl,
      ),
    ).toBe(false);
  });

  test("a Stellar Swirl's Anemo instance has a coefficient of 0.75", () => {
    expect.hasAssertions();
    const enemy = createSturdyEnemy();
    const context = createKitTestContext(combatant, { enemyTables });

    strikeStellarReaction(
      enemy,
      Element.Anemo,
      STELLAR_SWIRL_ANEMO_COEFFICIENT,
      new Set([TRAVELER_CHARACTER_ID]),
      combatant,
      context,
    );

    // The one contributor's level multiplier at the coefficient, weighted as the first place is, against the Anemo RES
    expect(enemy.maxHealth - enemy.health).toBeCloseTo(
      takeOne(CharacterLevelMultiplierMap, LEVEL) *
        0.75 *
        takeOne(LUNAR_CONTRIBUTION_WEIGHTS, 0) *
        getResistanceMultiplier(getEnemyResistance(kind, enemy, Element.Anemo)),
      6,
    );
  });

  test("a contributor's Stellar Glimmer reaction DMG bonus raises its share of the reaction by that amount", () => {
    expect.hasAssertions();
    const enemy = createSturdyEnemy();
    const context = createKitTestContext(combatant, { enemyTables });
    buffKitMember(context.kitEffectState, TRAVELER_CHARACTER_ID, {
      amount: 0.16,
      attribute: Attribute.StellarGlimmerReactionDamageBonus,
      secondsRemaining: 12,
      source: "test",
    });

    strikeStellarReaction(
      enemy,
      Element.Anemo,
      STELLAR_SWIRL_ANEMO_COEFFICIENT,
      new Set([TRAVELER_CHARACTER_ID]),
      combatant,
      context,
    );

    // The unbuffed share with its reaction bonus of sixteen per cent added to the Elemental Mastery's bonus, which is nil at zero
    expect(enemy.maxHealth - enemy.health).toBeCloseTo(
      takeOne(CharacterLevelMultiplierMap, LEVEL) *
        0.75 *
        takeOne(LUNAR_CONTRIBUTION_WEIGHTS, 0) *
        (1 + 0.16) *
        getResistanceMultiplier(getEnemyResistance(kind, enemy, Element.Anemo)),
      6,
    );
  });

  test("a party reaction bonus's flat base adds to a Stellar Swirl before the enemy's RES, once, to the reaction its creator makes", () => {
    expect.hasAssertions();
    const bonused: Combatant = {
      ...combatant,
      kit: { ...TRAVELER_KIT, getPartyReactionBonus: () => ({ additiveBaseDamageBonus: 100 }) },
    };
    expect(damageOfStellarSwirl(bonused) - damageOfStellarSwirl(combatant)).toBeCloseTo(
      100 * getResistanceMultiplier(getEnemyResistance(kind, createSturdyEnemy(), Element.Anemo)),
    );
  });

  test("a Stellar reaction's damage, its flat base among it, is multiplied by its creator's Elevation last", () => {
    expect.hasAssertions();
    const elevated: Combatant = {
      ...combatant,
      kit: { ...TRAVELER_KIT, getPartyReactionBonus: () => ({ additiveBaseDamageBonus: 100, elevationBonus: 0.2 }) },
    };
    const flat: Combatant = {
      ...combatant,
      kit: { ...TRAVELER_KIT, getPartyReactionBonus: () => ({ additiveBaseDamageBonus: 100 }) },
    };
    expect(damageOfStellarSwirl(elevated)).toBeCloseTo(damageOfStellarSwirl(flat) * (1 + 0.2));
  });

  test("a Stellar reaction's Base DMG takes the Base DMG Bonus each deployed Stellar Jubilee gives, two adding up", () => {
    expect.hasAssertions();
    const stellarJubilee = { getBaseDamageBonus: () => 0.07, stellarReactionTypes: [StellarReactionType.StellarSwirl] };
    const holder: Combatant = { ...combatant, kit: { ...TRAVELER_KIT, stellarJubilee } };
    const teammate: Combatant = { ...holder, characterId: TRAVELER_CHARACTER_ID + 1 };
    const enemy = createSturdyEnemy();
    const context = createKitTestContext(holder, {
      characterIdCombatantMap: new Map([
        [holder.characterId, holder],
        [teammate.characterId, teammate],
      ]),
      enemyTables,
      party: createParty([holder.characterId, teammate.characterId]),
    });

    strikeStellarReaction(
      enemy,
      Element.Anemo,
      STELLAR_SWIRL_ANEMO_COEFFICIENT,
      new Set([TRAVELER_CHARACTER_ID]),
      holder,
      context,
    );

    expect(enemy.maxHealth - enemy.health).toBeCloseTo(
      takeOne(CharacterLevelMultiplierMap, LEVEL) *
        0.75 *
        (1 + 0.07 + 0.07) *
        takeOne(LUNAR_CONTRIBUTION_WEIGHTS, 0) *
        getResistanceMultiplier(getEnemyResistance(kind, enemy, Element.Anemo)),
      6,
    );
  });
});
