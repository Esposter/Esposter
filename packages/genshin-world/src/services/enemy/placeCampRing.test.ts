import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { placeCampRing } from "#src/services/enemy/placeCampRing";
import { describe, expect, test } from "vitest";

describe(placeCampRing, () => {
  // Each position is rounded, since a quarter turn's cosine or sine is a rounding error away from zero
  test("the members stand evenly round the centre at the radius, each as the spawn it was given", () => {
    expect.hasAssertions();

    const members = placeCampRing({ x: 10, z: 20 }, 2, [
      { enemyKindId: EnemyKindId.AnemoSlime, level: 1 },
      { enemyKindId: EnemyKindId.EyeOfTheStorm, level: 2 },
      { enemyKindId: EnemyKindId.AnemoHypostasis, level: 3 },
      { enemyKindId: EnemyKindId.TaintedWaterSpoutingPhantasm, level: 4 },
    ]);

    expect(
      members.map(({ enemyKindId, id, level, patrol, position }) => ({
        enemyKindId,
        id,
        level,
        patrol,
        position: { x: Math.round(position.x), z: Math.round(position.z) },
      })),
    ).toStrictEqual([
      { enemyKindId: EnemyKindId.AnemoSlime, id: "0", level: 1, patrol: [], position: { x: 12, z: 20 } },
      { enemyKindId: EnemyKindId.EyeOfTheStorm, id: "1", level: 2, patrol: [], position: { x: 10, z: 22 } },
      { enemyKindId: EnemyKindId.AnemoHypostasis, id: "2", level: 3, patrol: [], position: { x: 8, z: 20 } },
      {
        enemyKindId: EnemyKindId.TaintedWaterSpoutingPhantasm,
        id: "3",
        level: 4,
        patrol: [],
        position: { x: 10, z: 18 },
      },
    ]);
  });
});
