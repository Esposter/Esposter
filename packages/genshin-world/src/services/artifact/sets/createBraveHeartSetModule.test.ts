import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { BRAVE_HEART_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createBraveHeartSetModule } from "#src/services/artifact/sets/createBraveHeartSetModule";
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
// An enemy holding the share of its max HP given
const createEnemyAtHealthShare = (healthShare: number) => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  enemy.health = enemy.maxHealth * healthShare;
  return enemy;
};

describe(createBraveHeartSetModule, () => {
  const wearer = createSetWearer(KIT);
  const strike: KitStrike = {
    attackTag: AttackTag.NormalAttack,
    body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
    combatant: wearer,
    hit: KIT.plungeCollision,
  };
  const party = createParty([TRAVELER_CHARACTER_ID]);

  test("raises the DMG of a strike on an enemy with more than half its HP by 30% from four pieces", () => {
    expect.hasAssertions();

    const { getStrikeDamageBonus } = createBraveHeartSetModule(
      getArtifactSetBonus(statTables, BRAVE_HEART_ARTIFACT_SET_ID, 4),
    );

    expect(getStrikeDamageBonus?.(strike, createEnemyAtHealthShare(1), party, [])).toBeCloseTo(0.3);
    expect(getStrikeDamageBonus?.(strike, createEnemyAtHealthShare(0.51), party, [])).toBeCloseTo(0.3);
  });

  test("raises no DMG on an enemy with half or less of its HP", () => {
    expect.hasAssertions();

    const { getStrikeDamageBonus } = createBraveHeartSetModule(
      getArtifactSetBonus(statTables, BRAVE_HEART_ARTIFACT_SET_ID, 4),
    );

    expect(getStrikeDamageBonus?.(strike, createEnemyAtHealthShare(0.5), party, [])).toBe(0);
    expect(getStrikeDamageBonus?.(strike, createEnemyAtHealthShare(0.3), party, [])).toBe(0);
  });
});
