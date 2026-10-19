import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { ominousStar } from "#src/services/gcg/cards/ominousStar";
import { describe, expect, test } from "vitest";

describe("ominousStar", () => {
  test("the Ominous Star summons the Darkfire Furnace on its side once its damage is dealt", () => {
    expect.hasAssertions();

    const side: { summons: GcgZoneCard[] } = { summons: [] };
    ominousStar.afterDamage?.({ duel: { sides: [side] } as unknown as GcgDuel, sideIndex: 0 });

    expect(side.summons.map(({ cardId }) => cardId)).toStrictEqual([123_021]);
  });
});
