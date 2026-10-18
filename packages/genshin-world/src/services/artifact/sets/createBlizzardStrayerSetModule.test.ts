import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";

import { AttackTag } from "#src/models/combat/AttackTag";
import { AuraType } from "#src/models/combat/AuraType";

import { BLIZZARD_STRAYER_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createBlizzardStrayerSetModule } from "#src/services/artifact/sets/createBlizzardStrayerSetModule";
import { createSetWearer } from "#src/services/artifact/sets/createSetWearer.test";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const wearer = createSetWearer(KIT);
const strike: KitStrike = {
  attackTag: AttackTag.NormalAttack,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant: wearer,
  hit: KIT.plungeCollision,
};
const party = createParty([TRAVELER_CHARACTER_ID]);
// An enemy under the auras given
const createEnemyUnder = (auraTypes: AuraType[]) => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  for (const auraType of auraTypes)
    enemy.elementalState.auras.set(auraType, { decayRate: 0, gauge: 1, isImmutable: false });
  return enemy;
};

describe(createBlizzardStrayerSetModule, () => {
  test("raises CRIT Rate by 20% against an enemy under Cryo, and by 20% more against a Frozen one, from four pieces", () => {
    expect.hasAssertions();

    const { getStrikeCriticalRateBonus } = createBlizzardStrayerSetModule(
      getArtifactSetBonus(statTables, BLIZZARD_STRAYER_ARTIFACT_SET_ID, 4),
    );

    expect(getStrikeCriticalRateBonus?.(strike, createEnemyUnder([AuraType.Cryo]), party, [])).toBeCloseTo(0.2);
    expect(
      getStrikeCriticalRateBonus?.(strike, createEnemyUnder([AuraType.Cryo, AuraType.Freeze]), party, []),
    ).toBeCloseTo(0.4);
    expect(getStrikeCriticalRateBonus?.(strike, createEnemyUnder([AuraType.Pyro]), party, [])).toBe(0);
  });
});
