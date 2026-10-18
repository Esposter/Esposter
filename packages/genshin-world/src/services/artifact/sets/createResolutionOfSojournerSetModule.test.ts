import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { RESOLUTION_OF_SOJOURNER_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createResolutionOfSojournerSetModule } from "#src/services/artifact/sets/createResolutionOfSojournerSetModule";
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
const createStrike = (attackTag: AttackTag): KitStrike => ({
  attackTag,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant: wearer,
  hit: KIT.plungeCollision,
});
const party = createParty([TRAVELER_CHARACTER_ID]);

describe(createResolutionOfSojournerSetModule, () => {
  test("raises the CRIT Rate of a charged attack by 30% from four pieces, and of no other strike", () => {
    expect.hasAssertions();

    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const { getStrikeCriticalRateBonus } = createResolutionOfSojournerSetModule(
      getArtifactSetBonus(statTables, RESOLUTION_OF_SOJOURNER_ARTIFACT_SET_ID, 4),
    );

    expect(getStrikeCriticalRateBonus?.(createStrike(AttackTag.ChargedAttack), enemy, party, [])).toBeCloseTo(0.3);
    expect(getStrikeCriticalRateBonus?.(createStrike(AttackTag.NormalAttack), enemy, party, [])).toBe(0);
  });
});
