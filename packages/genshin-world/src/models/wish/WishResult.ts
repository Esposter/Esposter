import type { CurrencyAmount } from "#src/models/inventory/CurrencyAmount";
import type { WishItem } from "#src/models/wish/WishItem";

// What one wish drew, whether Capturing Radiance made it the promotional character, and what it returned beside itself
export interface WishResult {
  isCapturingRadiance: boolean;
  item: WishItem;
  wishReturn?: CurrencyAmount;
}
