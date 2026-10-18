import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { describe, expect, test, vi } from "vitest";

describe("ominousStar", () => {
  // The bundle loads the Darkfire Furnace first, and the damage pipeline it imports reaches this skill before the furnace has finished loading
  test("the Ominous Star summons the Darkfire Furnace on its side once its damage is dealt", async () => {
    expect.hasAssertions();
    vi.resetModules();
    await import("#src/services/gcg/cards/darkfireFurnace");
    const { ominousStar } = await import("#src/services/gcg/cards/ominousStar");
    const side = { summons: [] };
    ominousStar.afterDamage?.({ duel: { sides: [side] } as unknown as GcgDuel, sideIndex: 0 } as Parameters<
      NonNullable<GcgSkillModule["afterDamage"]>
    >[0]);
    expect(side.summons).toStrictEqual([expect.objectContaining({ cardId: 123_021 })]);
  });
});
