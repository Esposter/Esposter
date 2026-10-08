import type { Wallet } from "#src/models/inventory/Wallet";
import type { Banner } from "#src/models/wish/Banner";
import type { WishPity } from "#src/models/wish/WishPity";

// A set of wishes asked for: the banner, how many, the copies of each character the player already holds by its id, and
// The banner kind's counters and the wallet before them
export interface WishRequest {
  banner: Banner;
  count: number;
  heldCountMap: ReadonlyMap<number, number>;
  pity: WishPity;
  wallet: Wallet;
}
