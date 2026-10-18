import { formatShopRefreshCountdown } from "#src/services/shop/formatShopRefreshCountdown";
import { describe, expect, test } from "vitest";

describe(formatShopRefreshCountdown, () => {
  test("a countdown of days reads its days, hours and minutes", () => {
    expect.hasAssertions();
    expect(formatShopRefreshCountdown(Temporal.Duration.from({ days: 30, hours: 15, minutes: 29 }))).toBe(
      "30d 15h 29min",
    );
  });

  test("a countdown under a day leaves its days out", () => {
    expect.hasAssertions();
    expect(formatShopRefreshCountdown(Temporal.Duration.from({ hours: 2, minutes: 5 }))).toBe("2h 5min");
  });

  test("a countdown under an hour reads its minutes alone", () => {
    expect.hasAssertions();
    expect(formatShopRefreshCountdown(Temporal.Duration.from({ minutes: 9, seconds: 40 }))).toBe("9min");
  });
});
