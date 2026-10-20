import type { CraftingStrongboxData } from "#src/models/crafting/CraftingStrongboxData";

import { computeMysticOfferingText } from "#src/services/crafting/computeMysticOfferingText";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(computeMysticOfferingText, () => {
  // Made-up words with the places marked, so the test reads no game text
  const REQUIREMENT = "Every {0} {1}-star artifacts offered will create a strongbox";
  const CONFIRM = "Consume {0} {1}-star artifacts to create {2} {3}?";
  const STRONGBOX: CraftingStrongboxData = {
    id: 90_001,
    nameTextId: "90_002",
    needCount: 3,
    pieceItemIds: [90_011],
    rarity: 4,
  };
  const NAMES = { "90_002": "Made-up Strongbox" };

  test("the offering's tip fills its artifact counts", () => {
    expect.hasAssertions();

    expect(computeMysticOfferingText(REQUIREMENT, STRONGBOX, NAMES)).toBe(
      "Every 3 4-star artifacts offered will create a strongbox",
    );
  });

  test("the offering's tip fills its artifact counts with three artifacts of five stars", () => {
    expect.hasAssertions();

    expect(
      computeMysticOfferingText(
        ENGLISH_GAME_TEXT[GameTextKey.MysticOfferingRequirement],
        { ...STRONGBOX, rarity: 5 },
        NAMES,
      ),
    ).toBe("Every 3 5-star artifacts offered will create an Artifact Strongbox");
  });

  test("the confirm fills the artifacts it consumes, the one strongbox it makes and that strongbox's name", () => {
    expect.hasAssertions();

    expect(computeMysticOfferingText(CONFIRM, STRONGBOX, NAMES)).toBe(
      "Consume 3 4-star artifacts to create 1 Made-up Strongbox?",
    );
  });
});
