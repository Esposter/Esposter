import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { ominousStar } from "#src/services/gcg/cards/ominousStar";
import { describe, expect, test } from "vitest";

describe("ominousStar", () => {
  test("the Ominous Star summons the Darkfire Furnace on its side once its damage is dealt", () => {
    expect.hasAssertions();

    const side = { summons: [] };
    ominousStar.afterDamage?.({ duel: { sides: [side] } as unknown as GcgDuel, sideIndex: 0 } as Parameters<
      NonNullable<GcgSkillModule["afterDamage"]>
    >[0]);

    expect(side.summons).toStrictEqual([expect.objectContaining({ cardId: 123_021 })]);
  });
});
