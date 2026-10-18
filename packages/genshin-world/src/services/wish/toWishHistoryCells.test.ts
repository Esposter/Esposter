import type { WishDrawSave } from "#src/models/wish/WishDrawSave";

import { toWishHistoryCells } from "#src/services/wish/toWishHistoryCells";
import { BannerKind } from "genshin-interface/save";
import { describe, expect, test } from "vitest";

describe(toWishHistoryCells, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const FIRST_ITEM_ID = 1;
  const SECOND_ITEM_ID = 2;
  const BANNER_LABEL = "Standard Wish";
  const TIME_ZONE = "UTC";
  const items = new Map([
    [FIRST_ITEM_ID, { name: "Alpha", rarity: 4 }],
    [SECOND_ITEM_ID, { name: "Beta", rarity: 5 }],
  ]);
  const earlierDraw: WishDrawSave = { bannerKind: BannerKind.Standard, itemId: FIRST_ITEM_ID, time: EPOCH.toString() };
  const laterDraw: WishDrawSave = {
    bannerKind: BannerKind.Standard,
    itemId: SECOND_ITEM_ID,
    time: EPOCH.add({ minutes: 90 }).toString(),
  };
  const minuteOf = (instant: Temporal.Instant) =>
    instant.toZonedDateTimeISO(TIME_ZONE).toPlainDateTime().toString({ smallestUnit: "minute" });

  test("should list the newest draw first, each with its banner, item name, rarity and minute", () => {
    expect.hasAssertions();
    expect(
      toWishHistoryCells(
        [earlierDraw, laterDraw],
        (itemId) => items.get(itemId) ?? { name: "", rarity: 0 },
        () => BANNER_LABEL,
        TIME_ZONE,
      ),
    ).toStrictEqual([
      { bannerLabel: BANNER_LABEL, name: "Beta", rarity: 5, time: minuteOf(EPOCH.add({ minutes: 90 })) },
      { bannerLabel: BANNER_LABEL, name: "Alpha", rarity: 4, time: minuteOf(EPOCH) },
    ]);
  });
});
