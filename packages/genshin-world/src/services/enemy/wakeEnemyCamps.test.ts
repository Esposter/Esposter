import type { EnemyCampMember } from "#src/models/enemy/EnemyCampMember";

import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { setEnemyState } from "#src/services/enemy/setEnemyState";
import { wakeEnemyCamps } from "#src/services/enemy/wakeEnemyCamps";
import { describe, expect, test } from "vitest";

describe(wakeEnemyCamps, () => {
  const member: EnemyCampMember = {
    enemyKindId: EnemyKindId.HilichurlFighter,
    id: "",
    level: 1,
    patrol: [],
    position: { x: 0, z: 0 },
  };

  test("alerts the idle members of a camp with an engaged member, and no other camp's", () => {
    expect.hasAssertions();

    const engagedEnemy = createEnemy(member, "");
    const campMate = createEnemy(member, "");
    const otherCampEnemy = createEnemy(member, " ");
    setEnemyState(engagedEnemy, EnemyState.Chase);
    wakeEnemyCamps([engagedEnemy, campMate, otherCampEnemy]);

    expect([engagedEnemy.state, campMate.state, otherCampEnemy.state]).toStrictEqual([
      EnemyState.Chase,
      EnemyState.Alert,
      EnemyState.Idle,
    ]);
  });
});
