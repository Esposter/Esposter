import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { LEAVE_IT_TO_ME_ID } from "#src/services/gcg/cards/constants";
import { leaveItToMe } from "#src/services/gcg/cards/leaveItToMe";
import { describe, expect, test } from "vitest";

describe("leaveItToMe", () => {
  test("playing it again refreshes the one on the field to its usage, and adds no second copy", () => {
    expect.hasAssertions();

    const side: { onstages: GcgZoneCard[] } = { onstages: [] };
    const context = { duel: { sides: [side] } as unknown as GcgDuel, sideIndex: 0 } as Parameters<
      NonNullable<GcgCardModule["play"]>
    >[0];
    leaveItToMe.play?.(context, undefined);
    leaveItToMe.play?.(context, undefined);

    expect(side.onstages).toStrictEqual([
      { cardId: LEAVE_IT_TO_ME_ID, counter: 0, rounds: 0, usages: leaveItToMe.initialUsages },
    ]);
  });
});
