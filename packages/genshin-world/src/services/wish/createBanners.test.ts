import type { WishScheduleEvent } from "#src/models/wish/WishScheduleEvent";

import { WishItemKind } from "#src/models/wish/WishItemKind";
import {
  BEGINNERS_WISH_CHARACTER_IDS,
  BEGINNERS_WISH_FEATURED_CHARACTER_ID,
  STANDARD_WISH_CHARACTER_IDS,
  STANDARD_WISH_WEAPON_IDS,
} from "#src/services/wish/constants";
import { createBanners } from "#src/services/wish/createBanners";
import { takeOne } from "@esposter/shared";
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

    const banners = createBanners(statTables, {}, [event]);
    const eventBanner = takeOne(banners, 1);
    const standardBanner = takeOne(banners, 2);
    expect(eventBanner.fiveStars).toStrictEqual(standardBanner.fiveStars);
    expect(eventBanner.fourStars).toStrictEqual(standardBanner.fourStars);
    expect(eventBanner.threeStars).toStrictEqual(standardBanner.threeStars);
  });

  test("a scheduled event banner is named by its schedule id and draws its featured five-star from the schedule", () => {
    expect.hasAssertions();

    const eventBanner = takeOne(createBanners(statTables, {}, [event]), 1);
    expect(eventBanner.id).toBe(event.id);
    expect(eventBanner.kind).toBe(BannerKind.CharacterEvent);
    expect(eventBanner.featuredFiveStars.map(({ id }) => id)).toStrictEqual([LIMITED_FEATURED_CHARACTER_ID]);
  });

  test("two character banners are offered together and share the character banners' counters", () => {
    expect.hasAssertions();

    const second: WishScheduleEvent = { ...event, id: "Second Event", kindNumber: 2 };
    const banners = createBanners(statTables, {}, [event, second]);
    const characterBanners = banners.filter(({ kind }) => kind === BannerKind.CharacterEvent);
    expect(characterBanners.map(({ id, kindNumber }) => ({ id, kindNumber }))).toStrictEqual([
      { id: event.id, kindNumber: 1 },
      { id: second.id, kindNumber: 2 },
    ]);
  });

  test("a featured item is read from whichever stat table holds its id", () => {
    expect.hasAssertions();

    const featuredWeaponId = takeOne(STANDARD_WISH_WEAPON_IDS);
    const eventBanner = takeOne(createBanners(statTables, {}, [{ ...event, fiveStarIds: [featuredWeaponId] }]), 1);
    expect(eventBanner.featuredFiveStars).toStrictEqual([
      { id: featuredWeaponId, kind: WishItemKind.Weapon, name: "", rarity: 5 },
    ]);
  });
});
