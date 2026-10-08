import type { OfferingLevel } from "#src/models/offering/OfferingLevel";

import { offerItems } from "#src/services/offering/offerItems";
import { describe, expect, test } from "vitest";

describe(offerItems, () => {
  const ANEMOCULUS_ITEM_ID = 107_001;
  const levels: OfferingLevel[] = [
    { itemCount: 0, itemId: 0, level: 1, rewards: [] },
    { itemCount: 1, itemId: ANEMOCULUS_ITEM_ID, level: 2, rewards: [] },
    { itemCount: 2, itemId: ANEMOCULUS_ITEM_ID, level: 3, rewards: [] },
  ];

  test("items short of the next level's count are held", () => {
    expect.hasAssertions();

    expect(offerItems({ heldCount: 0, level: 2, levels }, 1)).toStrictEqual({
      gainedLevels: [],
      progress: { heldCount: 1, level: 2, levels },
    });
  });

  test("the next level is reached once its items are held, which it takes off the count", () => {
    expect.hasAssertions();

    expect(offerItems({ heldCount: 0, level: 1, levels }, 1)).toStrictEqual({
      gainedLevels: [levels[1]],
      progress: { heldCount: 0, level: 2, levels },
    });
  });

  test("each level the held items cover is reached in turn", () => {
    expect.hasAssertions();

    expect(offerItems({ heldCount: 0, level: 1, levels }, 3)).toStrictEqual({
      gainedLevels: [levels[1], levels[2]],
      progress: { heldCount: 0, level: 3, levels },
    });
  });

  test("offering none starts an offering at its first level, which takes no items", () => {
    expect.hasAssertions();

    expect(offerItems({ heldCount: 0, level: 0, levels }, 0)).toStrictEqual({
      gainedLevels: [levels[0]],
      progress: { heldCount: 0, level: 1, levels },
    });
  });

  test("past the last level the items are held without a level to reach", () => {
    expect.hasAssertions();

    expect(offerItems({ heldCount: 1, level: 3, levels }, 1)).toStrictEqual({
      gainedLevels: [],
      progress: { heldCount: 2, level: 3, levels },
    });
  });
});
