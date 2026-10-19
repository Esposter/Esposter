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
import { createKitStrike } from "#src/services/kit/createKitStrike.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createResolutionOfSojournerSetModule, () => {
  const wearer = createSetWearer(KIT);
  const party = createParty([TRAVELER_CHARACTER_ID]);

  test("raises the CRIT Rate of a charged attack by 30% from four pieces, and of no other strike", () => {
    expect.hasAssertions();

    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const { getStrikeCriticalRateBonus } = createResolutionOfSojournerSetModule(
      getArtifactSetBonus(statTables, RESOLUTION_OF_SOJOURNER_ARTIFACT_SET_ID, 4),
    );

    expect(
      getStrikeCriticalRateBonus?.(createKitStrike(wearer, AttackTag.ChargedAttack), enemy, party, []),
    ).toBeCloseTo(0.3);
    expect(getStrikeCriticalRateBonus?.(createKitStrike(wearer, AttackTag.NormalAttack), enemy, party, [])).toBe(0);
  });
});
