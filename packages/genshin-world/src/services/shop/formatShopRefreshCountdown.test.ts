import { formatShopRefreshCountdown } from "#src/services/shop/formatShopRefreshCountdown";
import { ENGLISH_GAME_TEXT, fillGameTextValues, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

// The game's unit words for each count, joined by a space as the countdown joins them
const countdown = (...parts: [GameTextKey, number][]) =>
  parts.map(([key, count]) => fillGameTextValues(ENGLISH_GAME_TEXT[key], count)).join(" ");

describe(formatShopRefreshCountdown, () => {
  test("a countdown of days reads its days, hours and minutes", () => {
    expect.hasAssertions();
    expect(
      formatShopRefreshCountdown(ENGLISH_GAME_TEXT, Temporal.Duration.from({ days: 30, hours: 15, minutes: 29 })),
    ).toBe(
      countdown(
        [GameTextKey.WishTimeRemainingDays, 30],
        [GameTextKey.WishTimeRemainingHours, 15],
        [GameTextKey.WishTimeRemainingMinutes, 29],
      ),
    );
  });

  test("a countdown under a day leaves its days out", () => {
    expect.hasAssertions();
    expect(formatShopRefreshCountdown(ENGLISH_GAME_TEXT, Temporal.Duration.from({ hours: 2, minutes: 5 }))).toBe(
      countdown([GameTextKey.WishTimeRemainingHours, 2], [GameTextKey.WishTimeRemainingMinutes, 5]),
    );
  });

  test("a countdown under an hour reads its minutes alone", () => {
    expect.hasAssertions();
    expect(formatShopRefreshCountdown(ENGLISH_GAME_TEXT, Temporal.Duration.from({ minutes: 9, seconds: 40 }))).toBe(
      countdown([GameTextKey.WishTimeRemainingMinutes, 9]),
    );
  });
});
