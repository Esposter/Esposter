import type { WishScheduleEvent } from "#src/models/wish/WishScheduleEvent";

import { getOpenEventBanners } from "#src/services/wish/getOpenEventBanners";
import { BannerKind } from "genshin-interface";
import { describe, expect, test } from "vitest";

// The epoch's first day at the given hour, as the schedule writes its times
const atHour = (hours: number): number => Temporal.Instant.fromEpochMilliseconds(0).add({ hours }).epochMilliseconds;

// A scheduled event banner whose window runs from its start hour to its end hour
const createEvent = (id: string, kind: BannerKind, startHour: number, endHour: number): WishScheduleEvent => ({
  endTime: atHour(endHour),
  fiveStarIds: [],
  fourStarIds: [],
  id,
  kind,
  startTime: atHour(startHour),
});

describe(getOpenEventBanners, () => {
  test("a banner is offered inside its window", () => {
    expect.hasAssertions();

    const event = createEvent("a", BannerKind.WeaponEvent, 2, 5);

    expect(getOpenEventBanners([event], atHour(3))).toStrictEqual([event]);
  });

  test("a banner is not offered between windows", () => {
    expect.hasAssertions();

    expect(
      getOpenEventBanners(
        [createEvent("a", BannerKind.WeaponEvent, 2, 5), createEvent("b", BannerKind.CharacterEvent, 8, 12)],
        atHour(7),
      ),
    ).toStrictEqual([]);
  });

  test("two character banners alongside are both offered", () => {
    expect.hasAssertions();

    const events = [
      createEvent("a", BannerKind.CharacterEvent, 2, 5),
      createEvent("b", BannerKind.CharacterEvent, 1, 6),
    ];

    expect(getOpenEventBanners(events, atHour(3))).toStrictEqual(events);
  });
});
