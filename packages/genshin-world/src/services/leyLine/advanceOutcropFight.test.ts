import type { Outcrop } from "#src/models/leyLine/Outcrop";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { OutcropKind } from "#src/models/leyLine/OutcropKind";
import { OutcropStage } from "#src/models/leyLine/OutcropStage";
import { advanceOutcropFight } from "#src/services/leyLine/advanceOutcropFight";
import { checkIsBlossomRevealed } from "#src/services/leyLine/checkIsBlossomRevealed";
import { computeOutcropCampId } from "#src/services/leyLine/computeOutcropCampId";
import { describe, expect, test } from "vitest";

describe(advanceOutcropFight, () => {
  const PLACE_ID = 97_307;
  const placements = [{ id: PLACE_ID, position: { x: 0, z: 0 } }];
  const campId = computeOutcropCampId(PLACE_ID);
  const fighting: Outcrop = { kind: OutcropKind.Revelation, placeId: PLACE_ID, stage: OutcropStage.Fighting };

  test("defeating the last enemy reveals the blossom", () => {
    expect.hasAssertions();

    const stillStanding = advanceOutcropFight(placements, fighting, [
      { campId, state: EnemyState.Dead },
      { campId, state: EnemyState.Chase },
    ]);

    expect(checkIsBlossomRevealed(stillStanding)).toBe(false);
    expect(
      checkIsBlossomRevealed(
        advanceOutcropFight(placements, stillStanding, [
          { campId, state: EnemyState.Dead },
          { campId, state: EnemyState.Dead },
        ]),
      ),
    ).toBe(true);
  });

  test("defeating an enemy of another camp reveals nothing", () => {
    expect.hasAssertions();

    expect(
      advanceOutcropFight(placements, fighting, [
        { campId: computeOutcropCampId(PLACE_ID + 1), state: EnemyState.Dead },
      ]),
    ).toStrictEqual(fighting);
  });
});
