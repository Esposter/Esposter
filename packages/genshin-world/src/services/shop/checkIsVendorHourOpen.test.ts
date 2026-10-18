import { DAY_END_MINUTES, DAY_START_MINUTES } from "#src/services/resident/constants";
import { checkIsVendorHourOpen } from "#src/services/shop/checkIsVendorHourOpen";
import { DRAFF_SHOP_ID } from "#src/services/shop/constants";
import { describe, expect, test } from "vitest";

describe(checkIsVendorHourOpen, () => {
  const ALL_HOURS_SHOP_ID = 1004;

  test("a vendor is closed outside their hours", () => {
    expect.hasAssertions();
    expect(checkIsVendorHourOpen(DRAFF_SHOP_ID, DAY_START_MINUTES)).toBe(true);
    expect(checkIsVendorHourOpen(DRAFF_SHOP_ID, DAY_START_MINUTES - 1)).toBe(false);
    expect(checkIsVendorHourOpen(DRAFF_SHOP_ID, DAY_END_MINUTES)).toBe(false);
  });

  test("a vendor whose page gives no hours sells at any hour", () => {
    expect.hasAssertions();
    expect(checkIsVendorHourOpen(ALL_HOURS_SHOP_ID, 0)).toBe(true);
    expect(checkIsVendorHourOpen(ALL_HOURS_SHOP_ID, DAY_END_MINUTES)).toBe(true);
  });
});
