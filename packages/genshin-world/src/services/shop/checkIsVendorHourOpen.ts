import { DAY_END_MINUTES, DAY_START_MINUTES } from "#src/services/resident/constants";
import { DAY_VENDOR_SHOP_IDS } from "#src/services/shop/constants";

// Whether a city vendor's shop is open at a minute of the day: a vendor the wiki gives by day only sells from six in the
// Morning until seven at night, and every other vendor, whose page gives no hours, sells at any hour
export const checkIsVendorHourOpen = (shopId: number, minutes: number): boolean =>
  !DAY_VENDOR_SHOP_IDS.includes(shopId) || (minutes >= DAY_START_MINUTES && minutes < DAY_END_MINUTES);
