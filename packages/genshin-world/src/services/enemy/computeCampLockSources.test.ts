import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";

import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { computeCampLockSources } from "#src/services/enemy/computeCampLockSources";
import { ID_SEPARATOR } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const getSpawnKey = (memberId: string) => ["camp", memberId].join(ID_SEPARATOR);

describe(computeCampLockSources, () => {
  const FIRST_POSITION = { x: 1, y: 0, z: 2 };
  const SECOND_POSITION = { x: 4, y: 0, z: 2 };
  const camp: EnemyCamp = {
    areaId: "area",
    id: "camp",
    members: [
      { enemyKindId: EnemyKindId.HilichurlFighter, id: "first", level: 1, patrol: [], position: FIRST_POSITION },
      { enemyKindId: EnemyKindId.HilichurlFighter, id: "second", level: 1, patrol: [], position: SECOND_POSITION },
    ],
  };

  test("a camp is done once every member is dead or not spawned, its lock points its members' spawns", () => {
    expect.hasAssertions();

    expect(computeCampLockSources([camp], new Map([[getSpawnKey("first"), { state: EnemyState.Dead }]]))).toStrictEqual(
      [{ isDone: true, positions: [FIRST_POSITION, SECOND_POSITION] }],
    );
  });

  test("a camp is not done while one of its members stands alive", () => {
    expect.hasAssertions();

    expect(
      computeCampLockSources(
        [camp],
        new Map([
          [getSpawnKey("first"), { state: EnemyState.Dead }],
          [getSpawnKey("second"), { state: EnemyState.Idle }],
        ]),
      ),
    ).toStrictEqual([{ isDone: false, positions: [FIRST_POSITION, SECOND_POSITION] }]);
  });
});
