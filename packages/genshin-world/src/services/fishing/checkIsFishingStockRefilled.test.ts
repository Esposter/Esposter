import { checkIsFishingStockRefilled } from "#src/services/fishing/checkIsFishingStockRefilled";
import { FISH_STOCK_REFILL_DURATION } from "#src/services/fishing/constants";
import { describe, expect, test } from "vitest";

describe(checkIsFishingStockRefilled, () => {
  const EMPTIED_AT = Temporal.Instant.fromEpochMilliseconds(0);
  const REFILLED_AT = EMPTIED_AT.add(FISH_STOCK_REFILL_DURATION);

  test("a stock is back in full once the refill duration has passed since it was emptied, and not before", () => {
    expect.hasAssertions();

    expect(checkIsFishingStockRefilled(EMPTIED_AT, REFILLED_AT.subtract({ milliseconds: 1 }))).toBe(false);
    expect(checkIsFishingStockRefilled(EMPTIED_AT, REFILLED_AT)).toBe(true);
  });
});
