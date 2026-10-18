import type { OfferingLevel } from "#src/models/offering/OfferingLevel";

import { checkIsVendorShopOpen } from "#src/services/shop/checkIsVendorShopOpen";
import { MONDSTADT_SOUVENIR_SHOP_ID } from "#src/services/shop/constants";
import { describe, expect, test } from "vitest";

describe(checkIsVendorShopOpen, () => {
  const OTHER_SHOP_ID = 1004;
  const levels: OfferingLevel[] = [1, 2].map((level) => ({ itemCount: 1, itemId: 1, level, rewards: [] }));

  test("a Souvenir Shop of Mondstadt stays closed until the Frostbearing Tree is at its last level", () => {
    expect.hasAssertions();
    expect(checkIsVendorShopOpen(MONDSTADT_SOUVENIR_SHOP_ID, { heldCount: 0, level: 1, levels })).toBe(false);
    expect(checkIsVendorShopOpen(MONDSTADT_SOUVENIR_SHOP_ID, { heldCount: 0, level: 2, levels })).toBe(true);
  });

  test("a vendor's shop other than a Souvenir Shop is open whatever its region's offering", () => {
    expect.hasAssertions();
    expect(checkIsVendorShopOpen(OTHER_SHOP_ID, { heldCount: 0, level: 0, levels: [] })).toBe(true);
  });
});
