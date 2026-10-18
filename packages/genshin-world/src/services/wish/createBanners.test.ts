import type { WishScheduleEvent } from "#src/models/wish/WishScheduleEvent";

import {
  BEGINNERS_WISH_CHARACTER_IDS,
  BEGINNERS_WISH_FEATURED_CHARACTER_ID,
  STANDARD_WISH_CHARACTER_IDS,
  STANDARD_WISH_WEAPON_IDS,
} from "#src/services/wish/constants";
import { createBanners } from "#src/services/wish/createBanners";
import { BannerKind } from "genshin-interface";
import { describe, expect, test } from "vitest";

const LIMITED_FEATURED_CHARACTER_ID = 10_000_051;
const createItemDataMap = (ids: readonly number[]) =>
  new Map(ids.map((id) => [id, { nameTextId: String(id), rarity: 5 }]));
const statTables = {
  characterDataMap: createItemDataMap([
    ...STANDARD_WISH_CHARACTER_IDS,
    ...BEGINNERS_WISH_CHARACTER_IDS,
    BEGINNERS_WISH_FEATURED_CHARACTER_ID,
    LIMITED_FEATURED_CHARACTER_ID,
  ]),
  weaponDataMap: createItemDataMap(STANDARD_WISH_WEAPON_IDS),
};
const event: WishScheduleEvent = {
  endTime: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 1 }).epochMilliseconds,
  fiveStarIds: [LIMITED_FEATURED_CHARACTER_ID],
  fourStarIds: [],
  id: "Test Event",
  kind: BannerKind.CharacterEvent,
  kindNumber: 1,
  startTime: Temporal.Instant.fromEpochMilliseconds(0).epochMilliseconds,
};

describe(createBanners, () => {
  test("a scheduled event banner's non-featured pool is the Standard pool", () => {
    expect.hasAssertions();

    const [, eventBanner, standardBanner] = createBanners(statTables, {}, [event]);
    expect(eventBanner.fiveStars).toStrictEqual(standardBanner.fiveStars);
    expect(eventBanner.fourStars).toStrictEqual(standardBanner.fourStars);
    expect(eventBanner.threeStars).toStrictEqual(standardBanner.threeStars);
  });

  test("a scheduled event banner is named by its schedule id and draws its featured five-star from the schedule", () => {
    expect.hasAssertions();

    const [, eventBanner] = createBanners(statTables, {}, [event]);
    expect(eventBanner.id).toBe(event.id);
    expect(eventBanner.kind).toBe(BannerKind.CharacterEvent);
    expect(eventBanner.featuredFiveStars.map(({ id }) => id)).toStrictEqual([LIMITED_FEATURED_CHARACTER_ID]);
  });
});
