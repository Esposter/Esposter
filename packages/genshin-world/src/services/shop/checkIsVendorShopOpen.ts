import type { OfferingLevel } from "#src/models/offering/OfferingLevel";
import type { OfferingProgress } from "#src/models/offering/OfferingProgress";

import { checkIsSouvenirShopOpen } from "#src/services/shop/checkIsSouvenirShopOpen";
import { MONDSTADT_SOUVENIR_SHOP_ID } from "#src/services/shop/constants";

// Whether a city vendor's shop is open to the player: Mondstadt's Souvenir Shop only once the Frostbearing Tree, Mondstadt's
// Offering, is at its last level, and every other shop from the start, the offerings of the other regions not being built
export const checkIsVendorShopOpen = (
  shopId: number,
  frostbearingTreeProgress: OfferingProgress<OfferingLevel>,
): boolean => shopId !== MONDSTADT_SOUVENIR_SHOP_ID || checkIsSouvenirShopOpen(frostbearingTreeProgress);
