import type { Wallet } from "#src/models/inventory/Wallet";
import type { WishPity } from "#src/models/wish/WishPity";
import type { WishResult } from "#src/models/wish/WishResult";

// A wish ×1 or ×10: what each wish drew, and the counters and the wallet after them
export interface Wishes {
  pity: WishPity;
  results: WishResult[];
  wallet: Wallet;
}
