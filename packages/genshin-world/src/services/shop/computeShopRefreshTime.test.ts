import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { GAME_TIME_ZONE } from "#src/services/time/constants";
import { computeShopRefreshTime } from "#src/services/shop/computeShopRefreshTime";
import { describe, expect, test } from "vitest";

describe(computeShopRefreshTime, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  // The epoch is the first day's eight o'clock in the game's zone, four hours past that day's refresh
  const FIRST_MONTH_REFRESH = EPOCH.subtract({ hours: 4 });
  // The refresh of the month before, the first of the thirty-one days back from the epoch's day at its hour
  const PREVIOUS_MONTH_REFRESH = EPOCH.toZonedDateTimeISO(GAME_TIME_ZONE).subtract({ days: 31, hours: 4 }).toInstant();

  test("should count the month's refresh once its first day's game hour has come", () => {
    expect.hasAssertions();

    expect(computeShopRefreshTime(ShopRefresh.Monthly, EPOCH).epochMilliseconds).toBe(
      FIRST_MONTH_REFRESH.epochMilliseconds,
    );
  });

  test("should count the month before's refresh until the first day's game hour comes", () => {
    expect.hasAssertions();

    expect(computeShopRefreshTime(ShopRefresh.Monthly, EPOCH.subtract({ hours: 5 })).epochMilliseconds).toBe(
      PREVIOUS_MONTH_REFRESH.epochMilliseconds,
    );
  });

  test("should count the day's refresh at the game hour, the day before's until it comes", () => {
    expect.hasAssertions();

    expect(computeShopRefreshTime(ShopRefresh.Daily, EPOCH).epochMilliseconds).toBe(
      FIRST_MONTH_REFRESH.epochMilliseconds,
    );
    expect(computeShopRefreshTime(ShopRefresh.Daily, EPOCH.subtract({ hours: 5 })).epochMilliseconds).toBe(
      FIRST_MONTH_REFRESH.subtract({ hours: 24 }).epochMilliseconds,
    );
  });

  test("should count the week's refresh on the Monday at the game hour, the Monday before until it comes", () => {
    expect.hasAssertions();

    // The epoch is a Thursday, so the week's Monday before it is three days back, at the game hour
    const PREVIOUS_WEEK_REFRESH = EPOCH.subtract({ hours: 4 + 24 * 3 });
    const WEEK_REFRESH = EPOCH.add({ hours: 24 * 4 - 4 });

    expect(computeShopRefreshTime(ShopRefresh.Weekly, EPOCH).epochMilliseconds).toBe(
      PREVIOUS_WEEK_REFRESH.epochMilliseconds,
    );
    expect(computeShopRefreshTime(ShopRefresh.Weekly, WEEK_REFRESH.subtract({ hours: 1 })).epochMilliseconds).toBe(
      PREVIOUS_WEEK_REFRESH.epochMilliseconds,
    );
    expect(computeShopRefreshTime(ShopRefresh.Weekly, WEEK_REFRESH).epochMilliseconds).toBe(
      WEEK_REFRESH.epochMilliseconds,
    );
  });

  test("should count a good that never refreshes from the epoch", () => {
    expect.hasAssertions();

    expect(computeShopRefreshTime(ShopRefresh.None, EPOCH.add({ hours: 24 * 400 })).epochMilliseconds).toBe(0);
  });
});
