import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { changingShifts } from "#src/services/gcg/cards/changingShifts";
import { CHANGING_SHIFTS_ID } from "#src/services/gcg/cards/constants";
import { describe, expect, test } from "vitest";

describe("changingShifts", () => {
  test("playing it again refreshes the one on the field to its usage, and adds no second copy", () => {
    expect.hasAssertions();

    const side: { onstages: GcgZoneCard[] } = {
      onstages: [{ cardId: CHANGING_SHIFTS_ID, counter: 0, rounds: 0, usages: 0 }],
    };
    changingShifts.play?.({ duel: { sides: [side] } as unknown as GcgDuel, sideIndex: 0 }, undefined);

    expect(side.onstages).toStrictEqual([{ cardId: CHANGING_SHIFTS_ID, counter: 0, rounds: 0, usages: 1 }]);
  });
});
