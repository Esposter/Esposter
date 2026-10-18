import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { DestroyRule } from "#src/models/inventory/DestroyRule";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { AuraType } from "#src/models/combat/AuraType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getDeployedCombatants } from "#src/services/party/getDeployedCombatants";
import { getWeaponPassiveKit } from "#src/services/weapon/getWeaponPassiveKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
// Full HP Critic Up's weapon, with its name's text id and each refinement rank's CRIT Rate as its table gives them
const WEAPON_DATA: WeaponData = {
  ascensionPhases: [{ attributeLines: [], coinCost: 0, costItems: [], maxLevel: 20, requiredPlayerLevel: 0 }],
  baseExp: 0,
  destroyReturnMaterial: 0,
  destroyReturnMaterialCount: 0,
  destroyRule: DestroyRule.None,
  growAttributes: [],
  id: 11302,
  nameTextId: "1",
  passiveNameTextId: "2866125259",
  passiveRankAttributeLines: [[], [], [], [], []],
  passiveRankDescriptionTextIds: ["1", "2", "3", "4", "5"],
  passiveRankParams: [[0.14], [0.175], [0.21], [0.245], [0.28]],
  rarity: 3,
  refinementCosts: [500, 1000, 2000, 4000],
  refinementMaterialId: 0,
  weaponType: WeaponType.Sword,
};

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

describe(getWeaponPassiveKit, () => {
  test("a weapon at refinement rank one reads its first passive row", () => {
    expect.hasAssertions();

    expect(getCriticalRateLines(1)).toStrictEqual([{ amount: 0.14, attribute: Attribute.CriticalRate }]);
  });

  test("raising refinement changes the passive's effect", () => {
    expect.hasAssertions();

    expect(getCriticalRateLines(2)).toStrictEqual([{ amount: 0.175, attribute: Attribute.CriticalRate }]);
  });

  test("a bane passive raises its wielder's strike on an enemy under its elements", () => {
    expect.hasAssertions();

    // Bane of Water and Ice, whose name's text id and rank parameters its table gives
    const baneWeaponData: WeaponData = {
      ...WEAPON_DATA,
      id: 11301,
      passiveNameTextId: "523615731",
      passiveRankParams: [[0.12], [0.15], [0.18], [0.21], [0.24]],
    };
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
    ).toBe(0.12);
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
      { amount: 0.14, attribute: Attribute.CriticalRate },
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
      { amount: 0.14, attribute: Attribute.CriticalRate },
    ]);
  });
});
