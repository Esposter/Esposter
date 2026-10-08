import type { Wallet } from "#src/models/inventory/Wallet";
import type { WishPity } from "#src/models/wish/WishPity";
import type { WishResult } from "#src/models/wish/WishResult";

// A wish ×1 or ×10: what each wish drew, and the copies of each character held, the counters and the wallet after them.
// The Stella Fortuna a duplicate brought is counted per character it names, for the caller to hand over
export interface Wishes {
  heldCountMap: ReadonlyMap<number, number>;
  pity: WishPity;
  results: WishResult[];
  stellaFortunaCountMap: ReadonlyMap<number, number>;
  wallet: Wallet;
}
