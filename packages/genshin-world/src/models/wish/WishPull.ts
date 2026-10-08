import type { WishPity } from "#src/models/wish/WishPity";
import type { WishResult } from "#src/models/wish/WishResult";

// One wish: what it drew, and the counters after it
export interface WishPull {
  pity: WishPity;
  result: WishResult;
}
