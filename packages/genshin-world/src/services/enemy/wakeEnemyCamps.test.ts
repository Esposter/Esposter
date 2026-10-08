import { EnemyState } from "#src/models/enemy/EnemyState";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { setEnemyState } from "#src/services/enemy/setEnemyState";
import { wakeEnemyCamps } from "#src/services/enemy/wakeEnemyCamps";
import { describe, expect, test } from "vitest";

describe(wakeEnemyCamps, () => {
  test("alerts the idle members of a camp with an engaged ENEMY_CAMP_MEMBER, and no other camp's", () => {
    expect.hasAssertions();

    const engagedEnemy = createEnemy(ENEMY_CAMP_MEMBER, "");
    const campMate = createEnemy(ENEMY_CAMP_MEMBER, "");
    const otherCampEnemy = createEnemy(ENEMY_CAMP_MEMBER, " ");
    setEnemyState(engagedEnemy, EnemyState.Chase);
    wakeEnemyCamps([engagedEnemy, campMate, otherCampEnemy]);

    expect([engagedEnemy.state, campMate.state, otherCampEnemy.state]).toStrictEqual([
      EnemyState.Chase,
      EnemyState.Alert,
      EnemyState.Idle,
    ]);
  });
});
