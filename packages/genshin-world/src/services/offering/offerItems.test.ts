import type { OfferingLevel } from "#src/models/offering/OfferingLevel";

import { offerItems } from "#src/services/offering/offerItems";
import { describe, expect, test } from "vitest";

describe(offerItems, () => {
  const ANEMOCULUS_ITEM_ID = 107_001;
  const GEOCULUS_ITEM_ID = 107_002;
  const levels: OfferingLevel[] = [
    { items: [], level: 1, rewards: [] },
    { items: [{ itemCount: 1, itemId: ANEMOCULUS_ITEM_ID }], level: 2, rewards: [] },
    { items: [{ itemCount: 2, itemId: ANEMOCULUS_ITEM_ID }], level: 3, rewards: [] },
  ];
  // A level that takes two kinds of item at once, as the Lumenstone Adjuvant's does
  const twoItemLevels: OfferingLevel[] = [
    { items: [], level: 1, rewards: [] },
    {
      items: [
        { itemCount: 1, itemId: ANEMOCULUS_ITEM_ID },
        { itemCount: 2, itemId: GEOCULUS_ITEM_ID },
      ],
      level: 2,
      rewards: [],
    },
  ];

  test("items short of the next level's count are held", () => {
    expect.hasAssertions();

    expect(
      offerItems({ heldCounts: {}, level: 2, levels }, [{ itemCount: 1, itemId: ANEMOCULUS_ITEM_ID }]),
    ).toStrictEqual({ gainedLevels: [], progress: { heldCounts: { [ANEMOCULUS_ITEM_ID]: 1 }, level: 2, levels } });
  });

  test("the next level is reached once its items are held, which it takes off the count", () => {
    expect.hasAssertions();

    expect(
      offerItems({ heldCounts: {}, level: 1, levels }, [{ itemCount: 1, itemId: ANEMOCULUS_ITEM_ID }]),
    ).toStrictEqual({ gainedLevels: [levels[1]], progress: { heldCounts: {}, level: 2, levels } });
  });

  test("each level the held items cover is reached in turn", () => {
    expect.hasAssertions();

    expect(
      offerItems({ heldCounts: {}, level: 1, levels }, [{ itemCount: 3, itemId: ANEMOCULUS_ITEM_ID }]),
    ).toStrictEqual({ gainedLevels: [levels[1], levels[2]], progress: { heldCounts: {}, level: 3, levels } });
  });

  test("offering none starts an offering at its first level, which takes no items", () => {
    expect.hasAssertions();

    expect(offerItems({ heldCounts: {}, level: 0, levels }, [])).toStrictEqual({
      gainedLevels: [levels[0]],
      progress: { heldCounts: {}, level: 1, levels },
    });
  });

  test("past the last level the items are held without a level to reach", () => {
    expect.hasAssertions();

    expect(
      offerItems({ heldCounts: { [ANEMOCULUS_ITEM_ID]: 1 }, level: 3, levels }, [
        { itemCount: 1, itemId: ANEMOCULUS_ITEM_ID },
      ]),
    ).toStrictEqual({ gainedLevels: [], progress: { heldCounts: { [ANEMOCULUS_ITEM_ID]: 2 }, level: 3, levels } });
  });

  test("offering the items for a level raises the offering", () => {
    expect.hasAssertions();

    expect(
      offerItems({ heldCounts: {}, level: 1, levels: twoItemLevels }, [
        { itemCount: 1, itemId: ANEMOCULUS_ITEM_ID },
        { itemCount: 2, itemId: GEOCULUS_ITEM_ID },
      ]),
    ).toStrictEqual({
      gainedLevels: [twoItemLevels[1]],
      progress: { heldCounts: {}, level: 2, levels: twoItemLevels },
    });
  });

  test("a level with only some of its items held is not reached, and each kind of item is held apart", () => {
    expect.hasAssertions();

    expect(
      offerItems({ heldCounts: {}, level: 1, levels: twoItemLevels }, [{ itemCount: 1, itemId: ANEMOCULUS_ITEM_ID }]),
    ).toStrictEqual({
      gainedLevels: [],
      progress: { heldCounts: { [ANEMOCULUS_ITEM_ID]: 1 }, level: 1, levels: twoItemLevels },
    });
  });

  test("reaching a level takes off only that level's items, and the other items stay held", () => {
    expect.hasAssertions();

    expect(
      offerItems(
        { heldCounts: { [ANEMOCULUS_ITEM_ID]: 1, [GEOCULUS_ITEM_ID]: 3 }, level: 1, levels: twoItemLevels },
        [],
      ),
    ).toStrictEqual({
      gainedLevels: [twoItemLevels[1]],
      progress: { heldCounts: { [GEOCULUS_ITEM_ID]: 1 }, level: 2, levels: twoItemLevels },
    });
  });
});
