import type { CurrencyAmount } from "#src/models/inventory/CurrencyAmount";
import type { WishItem } from "#src/models/wish/WishItem";

// What one wish drew, whether Capturing Radiance made it the promotional character, what it returned beside itself, and
// The Stella Fortuna it brought: the drawn character's own, a duplicate among its first six copies bringing one, or the
// Masterless one a five-star brings past them
export interface WishResult {
  isCapturingRadiance: boolean;
  item: WishItem;
  masterlessStellaFortunaCount?: number;
  stellaFortunaCount?: number;
  wishReturn?: CurrencyAmount;
}
