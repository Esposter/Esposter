import type { Outcrop } from "#src/models/leyLine/Outcrop";
import type { OutcropPlacement } from "#src/models/leyLine/OutcropPlacement";

import { OutcropEvent } from "#src/models/leyLine/OutcropEvent";
import { OutcropKind } from "#src/models/leyLine/OutcropKind";
import { OutcropStage } from "#src/models/leyLine/OutcropStage";
import { advanceOutcrop } from "#src/services/leyLine/advanceOutcrop";
import { checkIsBlossomRevealed } from "#src/services/leyLine/checkIsBlossomRevealed";
import { describe, expect, test } from "vitest";

describe(checkIsBlossomRevealed, () => {
  const PLACE_ID = 11;
  const placements: OutcropPlacement[] = [];
  const waiting: Outcrop = { kind: OutcropKind.Revelation, placeId: PLACE_ID, stage: OutcropStage.Waiting };

  test("defeating the last enemy reveals the blossom", () => {
    expect.hasAssertions();

    const fighting = advanceOutcrop(placements, waiting, undefined, OutcropEvent.Touched);

    expect(checkIsBlossomRevealed(fighting)).toBe(false);
    expect(
      checkIsBlossomRevealed(advanceOutcrop(placements, fighting, undefined, OutcropEvent.LastEnemyDefeated)),
    ).toBe(true);
  });
});
