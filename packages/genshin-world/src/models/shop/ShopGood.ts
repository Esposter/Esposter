import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { z } from "zod";

// One good of a shop as the generated slice holds it: the item it gives and how many, the item it is bought with and how
// Many, its buy limit where zero is no limit, when that limit comes back, the Adventure Rank it shows from, and the
// Game-time moments it sells between, as ISO strings with the game's offset, and the Reputation level its Mora price is
// Discounted at, where its city's shops give one
export interface ShopGood {
  beginTime: string;
  buyLimit: number;
  endTime: string;
  goodsId: number;
  itemCount: number;
  itemId: number;
  minPlayerLevel: number;
  priceCount: number;
  priceItemId: number;
  refresh: ShopRefresh;
  reputationDiscountLevel?: number;
}

export const shopGoodSchema = z.object({
  beginTime: z.string(),
  buyLimit: z.int().nonnegative(),
  endTime: z.string(),
  goodsId: z.int().positive(),
  itemCount: z.int().positive(),
  itemId: z.int().positive(),
  minPlayerLevel: z.int().nonnegative(),
  priceCount: z.int().nonnegative(),
  priceItemId: z.int().positive(),
  refresh: z.enum(ShopRefresh),
  reputationDiscountLevel: z.int().positive().optional(),
}) satisfies z.ZodType<ShopGood>;
