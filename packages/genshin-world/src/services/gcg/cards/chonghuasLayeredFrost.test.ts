import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { chonghuasLayeredFrost } from "#src/services/gcg/cards/chonghuasLayeredFrost";
import { CHONGHUA_FROST_FIELD_ID } from "#src/services/gcg/cards/constants";
import { describe, expect, test } from "vitest";

describe("chonghuasLayeredFrost", () => {
  test("its damage refreshes the Chonghua Frost Field already on the field, and adds no second copy", () => {
    expect.hasAssertions();

    const side = { onstages: [{ cardId: CHONGHUA_FROST_FIELD_ID, counter: 0, rounds: 1, usages: 0 }] };
    chonghuasLayeredFrost.afterDamage?.({ duel: { sides: [side] } as unknown as GcgDuel, sideIndex: 0 });

    expect(side.onstages).toStrictEqual([{ cardId: CHONGHUA_FROST_FIELD_ID, counter: 0, rounds: 2, usages: 0 }]);
  });
});
