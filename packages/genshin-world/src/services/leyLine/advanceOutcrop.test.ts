import type { Outcrop } from "#src/models/leyLine/Outcrop";

import { OutcropEvent } from "#src/models/leyLine/OutcropEvent";
import { OutcropKind } from "#src/models/leyLine/OutcropKind";
import { OutcropStage } from "#src/models/leyLine/OutcropStage";
import { advanceOutcrop } from "#src/services/leyLine/advanceOutcrop";
import { describe, expect, test } from "vitest";

describe(advanceOutcrop, () => {
  const FIRST_PLACE_ID = 11;
  const SECOND_PLACE_ID = 12;
  const placements = [
    { id: FIRST_PLACE_ID, position: { x: 0, z: 0 } },
    { id: SECOND_PLACE_ID, position: { x: 50, z: 0 } },
  ];
  const waiting: Outcrop = { kind: OutcropKind.Revelation, placeId: FIRST_PLACE_ID, stage: OutcropStage.Waiting };

  test("touching a waiting outcrop starts its fight, and its last enemy's defeat clears it", () => {
    expect.hasAssertions();

    const fighting = advanceOutcrop(placements, waiting, undefined, OutcropEvent.Touched);

    expect(fighting).toStrictEqual({ ...waiting, stage: OutcropStage.Fighting });
    expect(advanceOutcrop(placements, fighting, undefined, OutcropEvent.LastEnemyDefeated)).toStrictEqual({
      ...waiting,
      stage: OutcropStage.Cleared,
    });
  });

  test("a cleared outcrop stays in place until the reset", () => {
    expect.hasAssertions();

    const cleared: Outcrop = { ...waiting, stage: OutcropStage.Cleared };

    expect(advanceOutcrop(placements, cleared, undefined, OutcropEvent.Touched)).toStrictEqual(cleared);
    expect(advanceOutcrop(placements, cleared, undefined, OutcropEvent.LastEnemyDefeated)).toStrictEqual(cleared);
  });

  test("claiming moves the outcrop to the nearest other place", () => {
    expect.hasAssertions();

    expect(
      advanceOutcrop(placements, { ...waiting, stage: OutcropStage.Cleared }, undefined, OutcropEvent.Claimed),
    ).toStrictEqual({ ...waiting, placeId: SECOND_PLACE_ID });
  });

  test("a claimed outcrop with no place to move to stays claimed until the reset", () => {
    expect.hasAssertions();

    const claimed: Outcrop = { ...waiting, stage: OutcropStage.Claimed };

    expect(
      advanceOutcrop(placements, { ...waiting, stage: OutcropStage.Cleared }, SECOND_PLACE_ID, OutcropEvent.Claimed),
    ).toStrictEqual(claimed);
  });
});
