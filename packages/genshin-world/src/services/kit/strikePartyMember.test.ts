import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ELEMENTAL_SHIELD_ABSORPTION } from "#src/services/combat/shield/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { EnemyKindTraitsMap } from "#src/services/enemy/EnemyKindTraitsMap";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { computeEnemyStrikeDamage } from "#src/services/kit/computeEnemyStrikeDamage";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { strikePartyMember } from "#src/services/kit/strikePartyMember";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { afterEach, describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(strikePartyMember, () => {
  const MAX_HEALTH = 1000;
  const DEFENSE = 100;
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([
      { attribute: Attribute.Health, value: MAX_HEALTH },
      { attribute: Attribute.Defense, value: DEFENSE },
    ]),
    characterId: 1,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };
  const characterIdCombatantMap = new Map([[1, combatant]]);
  const hilichurlFighterTraits = EnemyKindTraitsMap[EnemyKindId.HilichurlFighter];

  afterEach(() => {
    EnemyKindTraitsMap[EnemyKindId.HilichurlFighter] = hilichurlFighterTraits;
  });

  test("takes the share of the member's Max HP that an enemy's strike does through its defence", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const damage = computeEnemyStrikeDamage(enemyTables, enemy, combatant);

    strikePartyMember(enemyTables, party, enemy, combatant, { effects: [] }, characterIdCombatantMap);

    expect(getPartyMember(party, 1).healthShare).toBeCloseTo(1 - damage / MAX_HEALTH);
  });

  test("a member's DMG Reduction lowers an enemy's strike on it, as its buffs leave it", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const damage = computeEnemyStrikeDamage(enemyTables, enemy, combatant);
    const kitEffectState: KitEffectState = { effects: [] };
    buffKitMember(kitEffectState, 1, {
      amount: 0.35,
      attribute: Attribute.DamageReduction,
      secondsRemaining: 10,
      source: "test",
    });

    strikePartyMember(enemyTables, party, enemy, combatant, kitEffectState, characterIdCombatantMap);

    expect(getPartyMember(party, 1).healthShare).toBeCloseTo(1 - (damage * (1 - 0.35)) / MAX_HEALTH);
  });

  test("a DMG Reduction past the whole leaves an enemy's strike no damage", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const kitEffectState: KitEffectState = { effects: [] };
    buffKitMember(kitEffectState, 1, {
      amount: 1.2,
      attribute: Attribute.DamageReduction,
      secondsRemaining: 10,
      source: "test",
    });

    strikePartyMember(enemyTables, party, enemy, combatant, kitEffectState, characterIdCombatantMap);

    expect(getPartyMember(party, 1).healthShare).toBe(1);
  });

  test("a shield takes an enemy's strike first, and the damage past its health is what the member loses", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const damage = computeEnemyStrikeDamage(enemyTables, enemy, combatant);
    const shieldHealth = damage / 2;
    const kitEffectState: KitEffectState = {
      effects: [{ characterId: 1, health: shieldHealth, kind: "shield", secondsRemaining: 12 }],
    };

    strikePartyMember(enemyTables, party, enemy, combatant, kitEffectState, characterIdCombatantMap);

    expect(getPartyMember(party, 1).healthShare).toBeCloseTo(1 - (damage - shieldHealth) / MAX_HEALTH);
    expect(kitEffectState.effects).toStrictEqual([{ characterId: 1, health: 0, kind: "shield", secondsRemaining: 0 }]);
  });

  test("an enemy's strike applies its attack element to the member it strikes", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    EnemyKindTraitsMap[EnemyKindId.HilichurlFighter] = { ...hilichurlFighterTraits, attackElement: Element.Cryo };
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

    strikePartyMember(enemyTables, party, enemy, combatant, { effects: [] }, characterIdCombatantMap);

    expect([...getPartyMember(party, 1).elementalState.auras.keys()]).toStrictEqual([AuraType.Cryo]);
  });

  test("an elemental shield absorbs an enemy's strike of its own element 250% as effectively", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    const createdEnemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const enemy = { ...createdEnemy, traits: { ...createdEnemy.traits, attackElement: Element.Cryo } };
    const damage = computeEnemyStrikeDamage(enemyTables, enemy, combatant);
    const shieldHealth = damage / (2 * ELEMENTAL_SHIELD_ABSORPTION);
    const kitEffectState: KitEffectState = {
      effects: [{ characterId: 1, element: Element.Cryo, health: shieldHealth, kind: "shield", secondsRemaining: 12 }],
    };

    strikePartyMember(enemyTables, party, enemy, combatant, kitEffectState, characterIdCombatantMap);

    expect(getPartyMember(party, 1).healthShare).toBeCloseTo(1 - damage / 2 / MAX_HEALTH);
  });

  test("reports to the shield's owner the damage the shield absorbed, the health it has left, and the member the strike was on", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const damage = computeEnemyStrikeDamage(enemyTables, enemy, combatant);
    const kitEffectState: KitEffectState = {
      effects: [{ characterId: 2, health: damage * 3, kind: "shield", secondsRemaining: 12 }],
    };

    expect(
      strikePartyMember(enemyTables, party, enemy, combatant, kitEffectState, characterIdCombatantMap),
    ).toStrictEqual([
      { amount: damage, characterId: 2, health: damage * 2, kind: KitEventKind.ShieldAbsorbed, struckCharacterId: 1 },
      { isShielded: true, kind: KitEventKind.PartyMemberStruck, striker: enemy, struckCharacterId: 1 },
    ]);
  });

  test("an enemy's strike on an unshielded member is told to the kits", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

    expect(
      strikePartyMember(enemyTables, party, enemy, combatant, { effects: [] }, characterIdCombatantMap),
    ).toStrictEqual([
      { isShielded: false, kind: KitEventKind.PartyMemberStruck, striker: enemy, struckCharacterId: 1 },
    ]);
  });

  test("a strike a shield absorbs whole is told to the kits, the member losing no HP", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const damage = computeEnemyStrikeDamage(enemyTables, enemy, combatant);
    const kitEffectState: KitEffectState = {
      effects: [{ characterId: 1, health: damage * 3, kind: "shield", secondsRemaining: 12 }],
    };

    const struckEvents = strikePartyMember(
      enemyTables,
      party,
      enemy,
      combatant,
      kitEffectState,
      characterIdCombatantMap,
    ).filter(({ kind }) => kind === KitEventKind.PartyMemberStruck);

    expect(getPartyMember(party, 1).healthShare).toBe(1);
    expect(struckEvents).toStrictEqual([
      { isShielded: true, kind: KitEventKind.PartyMemberStruck, striker: enemy, struckCharacterId: 1 },
    ]);
  });
});
