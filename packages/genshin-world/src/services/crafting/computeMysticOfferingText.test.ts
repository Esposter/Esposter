import type { CraftingStrongboxData } from "#src/models/crafting/CraftingStrongboxData";

import { computeMysticOfferingText } from "#src/services/crafting/computeMysticOfferingText";
import { describe, expect, test } from "vitest";

describe(computeMysticOfferingText, () => {
  // Made-up words with the two counts' places marked, so the test reads no game text
  const REQUIREMENT = "Every {0} {1}-star artifacts offered will create a strongbox";

  test("the offering's tip fills its artifact counts", () => {
    expect.hasAssertions();

    const strongbox: CraftingStrongboxData = {
      id: 90_001,
      nameTextId: "90_002",
      needCount: 3,
      pieceItemIds: [90_011],
      rarity: 4,
    };

    expect(computeMysticOfferingText(REQUIREMENT, strongbox)).toBe(
      "Every 3 4-star artifacts offered will create a strongbox",
    );
  });
});
