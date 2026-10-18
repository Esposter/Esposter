import type { Outcrop } from "#src/models/leyLine/Outcrop";

import { OutcropKind } from "#src/models/leyLine/OutcropKind";
import { OutcropEvent } from "#src/models/leyLine/OutcropEvent";
import { OutcropStage } from "#src/models/leyLine/OutcropStage";
import { advanceOutcrop } from "#src/services/leyLine/advanceOutcrop";
import { describe, expect, test } from "vitest";

describe(advanceOutcrop, () => {
  const FIRST_PLACE_ID = 11;
  const SECOND_PLACE_ID = 12;
  const region = {
    kinds: [],
    places: [
      { id: FIRST_PLACE_ID, nextIds: [SECOND_PLACE_ID], sectionId: 1 },
      { id: SECOND_PLACE_ID, nextIds: [], sectionId: 1 },
    ],
    sectionIds: [1],
  };
  const waiting: Outcrop = { kind: OutcropKind.Revelation, placeId: FIRST_PLACE_ID, stage: OutcropStage.Waiting };

  test("touching a waiting outcrop starts its fight, and its last enemy's defeat clears it", () => {
    expect.hasAssertions();

    const fighting = advanceOutcrop(region, waiting, undefined, OutcropEvent.Touched);

    expect(fighting).toStrictEqual({ ...waiting, stage: OutcropStage.Fighting });
    expect(advanceOutcrop(region, fighting, undefined, OutcropEvent.LastEnemyDefeated)).toStrictEqual({
      ...waiting,
      stage: OutcropStage.Cleared,
    });
  });

  test("a cleared outcrop stays in place until the reset", () => {
    expect.hasAssertions();

    const cleared: Outcrop = { ...waiting, stage: OutcropStage.Cleared };

    expect(advanceOutcrop(region, cleared, undefined, OutcropEvent.Touched)).toStrictEqual(cleared);
    expect(advanceOutcrop(region, cleared, undefined, OutcropEvent.LastEnemyDefeated)).toStrictEqual(cleared);
  });

  test("claiming moves the outcrop to its group's next place", () => {
    expect.hasAssertions();

    expect(
      advanceOutcrop(region, { ...waiting, stage: OutcropStage.Cleared }, undefined, OutcropEvent.Claimed),
    ).toStrictEqual({ ...waiting, placeId: SECOND_PLACE_ID });
  });

  test("a claimed outcrop with no place to move to stays claimed until the reset", () => {
    expect.hasAssertions();

    const claimed: Outcrop = { ...waiting, placeId: SECOND_PLACE_ID, stage: OutcropStage.Claimed };

    expect(
      advanceOutcrop(
        region,
        { ...waiting, placeId: SECOND_PLACE_ID, stage: OutcropStage.Cleared },
        undefined,
        OutcropEvent.Claimed,
      ),
    ).toStrictEqual(claimed);
  });
});
