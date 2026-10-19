import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { ICICLE_ID } from "#src/services/gcg/cards/constants";
import { glacialWaltz } from "#src/services/gcg/cards/glacialWaltz";
import { icicle } from "#src/services/gcg/cards/icicle";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe("glacialWaltz", () => {
  test("its damage again refreshes the Icicle on the field to its usages, and adds no second copy", () => {
    expect.hasAssertions();

    const side: { onstages: GcgZoneCard[] } = { onstages: [] };
    const context = { duel: { sides: [side] } as unknown as GcgDuel, sideIndex: 0 } as Parameters<
      NonNullable<GcgSkillModule["afterDamage"]>
    >[0];
    glacialWaltz.afterDamage?.(context);
    takeOne(side.onstages, 0).usages -= 1;
    glacialWaltz.afterDamage?.(context);

    expect(side.onstages).toStrictEqual([{ cardId: ICICLE_ID, counter: 0, rounds: 0, usages: icicle.initialUsages }]);
  });
});
