import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { PassiveModule } from "#src/models/kit/PassiveModule";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { AuraType } from "#src/models/combat/AuraType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getDeployedCombatants } from "#src/services/party/getDeployedCombatants";
import { getWeaponPassiveKit } from "#src/services/weapon/getWeaponPassiveKit";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test, vi } from "vitest";

// The team's effects the gated passive is given, a non-empty list so only that list itself passes the gate
const { GATED_EFFECTS } = vi.hoisted(() => ({
  GATED_EFFECTS: [{ characterId: 1, id: "test", kind: "status", secondsRemaining: 1 }] satisfies KitEffect[],
}));

// Adds a passive whose strike damage bonus is gated on the team's effects being the list the test passes, keeping the
// Real passives as they are
vi.mock(import("#src/services/weapon/WeaponPassiveNameTextIdCreateModuleMap"), async (importOriginal) => {
  const { WeaponPassiveNameTextIdCreateModuleMap } = await importOriginal<{
    WeaponPassiveNameTextIdCreateModuleMap: Record<string, unknown>;
  }>();
  return {
    WeaponPassiveNameTextIdCreateModuleMap: {
      ...WeaponPassiveNameTextIdCreateModuleMap,
      GATED: (): PassiveModule => ({
        getStrikeDamageBonus: (_strike, _enemy, _party, effects) => (effects === GATED_EFFECTS ? 0.1 : 0),
      }),
    },
  };
});

const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const { weaponDataMap } = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
// A weapon's record in the stats table, by the id a test names it with
const readWeaponData = (id: number): WeaponData => {
  const weaponData = weaponDataMap.get(id);
  assert.exists(weaponData);
  return weaponData;
};
// One value of a weapon's passive at a refinement rank, as its record in the stats table gives it
const readPassiveParam = (weaponData: WeaponData, refinement: number, index: number): number =>
  takeOne(takeOne(weaponData.passiveRankParams, refinement - 1), index);

describe(getWeaponPassiveKit, () => {
  // Full HP Critic Up's weapon, as its record in the stats table gives it
  const WEAPON_DATA = readWeaponData(11302);

  // The CRIT Rate a wielder of the weapon at a refinement rank is priced with at full HP
  const getCriticalRateLines = (refinement: number, kit: Kit = KIT) => {
    const weaponKit = getWeaponPassiveKit(
      kit,
      { ascension: 0, experience: 0, id: 11302, level: 1, refinement },
      WEAPON_DATA,
    );
    const combatant: Combatant = {
      ascension: 0,
      attributes: computeCharacterAttributes([]),
      characterId: TRAVELER_CHARACTER_ID,
      constellationCount: 0,
      elementalResonances: [],
      kit: weaponKit,
      level: 90,
    };
    return (weaponKit.getPassiveBonuses?.(combatant, 1, [], []) ?? []).filter(
      ({ attribute }) => attribute === Attribute.CriticalRate,
    );
  };

  test("a weapon at refinement rank one reads its first passive row", () => {
    expect.hasAssertions();

    expect(getCriticalRateLines(1)).toStrictEqual([
      { amount: readPassiveParam(WEAPON_DATA, 1, 0), attribute: Attribute.CriticalRate },
    ]);
  });

  test("raising refinement changes the passive's effect", () => {
    expect.hasAssertions();

    expect(getCriticalRateLines(2)).toStrictEqual([
      { amount: readPassiveParam(WEAPON_DATA, 2, 0), attribute: Attribute.CriticalRate },
    ]);
  });

  test("a bane passive raises its wielder's strike on an enemy under its elements", () => {
    expect.hasAssertions();

    // Bane of Water and Ice, as its record in the stats table gives it
    const baneWeaponData = readWeaponData(11301);
    const weaponKit = getWeaponPassiveKit(
      KIT,
      { ascension: 0, experience: 0, id: 11301, level: 1, refinement: 1 },
      baneWeaponData,
    );
    const combatant: Combatant = {
      ascension: 0,
      attributes: computeCharacterAttributes([]),
      characterId: TRAVELER_CHARACTER_ID,
      constellationCount: 0,
      elementalResonances: [],
      kit: weaponKit,
      level: 90,
    };
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    enemy.elementalState.auras.set(AuraType.Hydro, { decayRate: 0, gauge: 1, isImmutable: false });

    expect(
      weaponKit.getStrikeDamageBonus?.(
        {
          body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
          combatant,
          hit: takeOne(takeOne(KIT.normalAttacks).hits),
        },
        enemy,
        createParty([TRAVELER_CHARACTER_ID]),
        [],
      ),
    ).toBe(readPassiveParam(baneWeaponData, 1, 0));
  });

  test("a passive is given the wielder's HP share second and the deployed team third, as the contract names them", () => {
    expect.hasAssertions();

    // A base kit whose one line counts the deployed team it is given, beside Full HP Critic Up's line at full HP
    const teamCountKit: Kit = {
      ...KIT,
      getPassiveBonuses: (_combatant, _healthShare, deployedCombatants) => [
        { amount: deployedCombatants.length, attribute: Attribute.CriticalRate },
      ],
    };
    const weaponKit = getWeaponPassiveKit(
      teamCountKit,
      { ascension: 0, experience: 0, id: 11302, level: 1, refinement: 1 },
      WEAPON_DATA,
    );
    const OTHER_CHARACTER_ID = 1;
    const combatant: Combatant = {
      ascension: 0,
      attributes: computeCharacterAttributes([]),
      characterId: TRAVELER_CHARACTER_ID,
      constellationCount: 0,
      elementalResonances: [],
      kit: weaponKit,
      level: 90,
    };
    const characterIdCombatantMap = new Map([
      [TRAVELER_CHARACTER_ID, combatant],
      [OTHER_CHARACTER_ID, { ...combatant, characterId: OTHER_CHARACTER_ID, kit: KIT }],
    ]);
    const party = createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    expect(
      weaponKit.getPassiveBonuses?.(combatant, 1, getDeployedCombatants(party, characterIdCombatantMap), []),
    ).toStrictEqual([
      { amount: 2, attribute: Attribute.CriticalRate },
      { amount: readPassiveParam(WEAPON_DATA, 1, 0), attribute: Attribute.CriticalRate },
    ]);
  });

  test("a kit's own passive is given the team's effects fourth, as the contract names them", () => {
    expect.hasAssertions();

    // A base kit whose one line counts the team's effects it is given, beside Full HP Critic Up's line at full HP
    const effectCountKit: Kit = {
      ...KIT,
      getPassiveBonuses: (_combatant, _healthShare, _deployedCombatants, effects) => [
        { amount: effects.length, attribute: Attribute.CriticalRate },
      ],
    };
    const weaponKit = getWeaponPassiveKit(
      effectCountKit,
      { ascension: 0, experience: 0, id: 11302, level: 1, refinement: 1 },
      WEAPON_DATA,
    );
    const combatant: Combatant = {
      ascension: 0,
      attributes: computeCharacterAttributes([]),
      characterId: TRAVELER_CHARACTER_ID,
      constellationCount: 0,
      elementalResonances: [],
      kit: weaponKit,
      level: 90,
    };
    const context = createKitTestContext(combatant);
    addKitHold(context.kitEffectState, TRAVELER_CHARACTER_ID, {
      id: "test",
      maximum: 1,
      seconds: Number.POSITIVE_INFINITY,
    });

    expect(weaponKit.getPassiveBonuses?.(combatant, 1, [], context.kitEffectState.effects)).toStrictEqual([
      { amount: 1, attribute: Attribute.CriticalRate },
      { amount: readPassiveParam(WEAPON_DATA, 1, 0), attribute: Attribute.CriticalRate },
    ]);
  });

  test("forwards the team's effects to a weapon passive's strike damage bonus, as the kit's own bonus reads them", () => {
    expect.hasAssertions();
    const weaponKit = getWeaponPassiveKit(
      KIT,
      { ascension: 0, experience: 0, id: 11302, level: 1, refinement: 1 },
      { ...WEAPON_DATA, passiveNameTextId: "GATED", passiveRankParams: [[]] },
    );
    const combatant: Combatant = {
      ascension: 0,
      attributes: computeCharacterAttributes([]),
      characterId: TRAVELER_CHARACTER_ID,
      constellationCount: 0,
      elementalResonances: [],
      kit: weaponKit,
      level: 90,
    };

    expect(
      weaponKit.getStrikeDamageBonus?.(
        {
          body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
          combatant,
          hit: takeOne(takeOne(KIT.normalAttacks).hits),
        },
        createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
        createParty([TRAVELER_CHARACTER_ID]),
        GATED_EFFECTS,
      ),
    ).toBe(0.1);
  });

  test("the Samurai Conduct of Katsuragikiri Nagamasa raises its wielder's Elemental Skill DMG at rank one", () => {
    expect.hasAssertions();

    // Katsuragikiri Nagamasa, as its record in the stats table gives it
    const samuraiWeaponData = readWeaponData(12414);
    const weaponKit = getWeaponPassiveKit(
      KIT,
      { ascension: 0, experience: 0, id: 12414, level: 1, refinement: 1 },
      samuraiWeaponData,
    );
    const combatant: Combatant = {
      ascension: 0,
      attributes: computeCharacterAttributes([]),
      characterId: TRAVELER_CHARACTER_ID,
      constellationCount: 0,
      elementalResonances: [],
      kit: weaponKit,
      level: 90,
    };

    expect(
      weaponKit.getStrikeDamageBonus?.(
        {
          attackTag: AttackTag.ElementalSkill,
          body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
          combatant,
          hit: takeOne(takeOne(KIT.normalAttacks).hits),
        },
        createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
        createParty([TRAVELER_CHARACTER_ID]),
        [],
      ),
    ).toBe(readPassiveParam(samuraiWeaponData, 1, 0));
  });

  test("staff of Homa's ATK follows a teammate's Max HP buff on its wielder, from the buffed Max HP", () => {
    expect.hasAssertions();

    // Staff of Homa at its first rank, as its record in the stats table gives it
    const homaWeaponData = readWeaponData(13501);
    const homaWeaponKit = getWeaponPassiveKit(
      KIT,
      { ascension: 0, experience: 0, id: 13501, level: 1, refinement: 1 },
      homaWeaponData,
    );
    const combatant: Combatant = {
      ascension: 0,
      attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10000 }]),
      characterId: TRAVELER_CHARACTER_ID,
      constellationCount: 0,
      elementalResonances: [],
      kit: homaWeaponKit,
      level: 90,
    };
    // A teammate's kit writes the buff onto the wielder through buffKitMember, as its own action does
    const kitEffectState: KitEffectState = { effects: [] };
    buffKitMember(kitEffectState, TRAVELER_CHARACTER_ID, {
      amount: 1000,
      attribute: Attribute.Health,
      secondsRemaining: 1,
    });
    const party = createParty([TRAVELER_CHARACTER_ID]);
    const characterIdCombatantMap = new Map([[TRAVELER_CHARACTER_ID, combatant]]);
    const unbuffed = getBuffedCombatant(combatant, [], party, characterIdCombatantMap);
    const buffed = getBuffedCombatant(combatant, kitEffectState.effects, party, characterIdCombatantMap);

    expect(buffed.attributes.attack - unbuffed.attributes.attack).toBeCloseTo(
      readPassiveParam(homaWeaponData, 1, 1) * (buffed.attributes.maxHealth - unbuffed.attributes.maxHealth),
    );
  });
});
