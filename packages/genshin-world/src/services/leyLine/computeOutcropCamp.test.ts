import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { Outcrop } from "#src/models/leyLine/Outcrop";

import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { OutcropKind } from "#src/models/leyLine/OutcropKind";
import { OutcropStage } from "#src/models/leyLine/OutcropStage";
import { computeOutcropCamp } from "#src/services/leyLine/computeOutcropCamp";
import { describe, expect, test } from "vitest";

describe(computeOutcropCamp, () => {
  const PLACE_ID = 11;
  const camp: EnemyCamp = {
    areaId: "mondstadt",
    id: `outcrop-${PLACE_ID}`,
    members: [
      {
        enemyKindId: EnemyKindId.HilichurlFighter,
        id: `outcrop-${PLACE_ID}-1`,
        level: 1,
        patrol: [],
        position: { x: 0, z: 0 },
      },
    ],
  };
  const waiting: Outcrop = { kind: OutcropKind.Revelation, placeId: PLACE_ID, stage: OutcropStage.Waiting };

  test("touching an outcrop spawns its enemies", () => {
    expect.hasAssertions();

    expect(computeOutcropCamp([camp], waiting)).toStrictEqual(camp);
  });

  test("an outcrop already fighting, or with no camp at its place, spawns none", () => {
    expect.hasAssertions();

    expect(computeOutcropCamp([camp], { ...waiting, stage: OutcropStage.Fighting })).toBeUndefined();
    expect(computeOutcropCamp([], waiting)).toBeUndefined();
  });
});
