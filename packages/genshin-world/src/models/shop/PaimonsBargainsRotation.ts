import type { ShopGood, ShopGoodLimit } from "#src/models/shop/ShopGood";
import type { ShopGoodCost } from "#src/models/shop/ShopGoodCost";

import { shopGoodCostSchema } from "#src/models/shop/ShopGoodCost";
import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { z } from "zod";

// One character or weapon of Paimon's Bargains as a good: its goods id and limit, the id it gives (an avatar's for a
// Character, a weapon's for a weapon), how many it gives, and the costs it is bought with. It has no sale dates, since the
// Rotation gives none, so it is always on offer while its month holds
export type PaimonsBargainsGood = Pick<ShopGood, "costs" | "itemCount" | "itemId"> & ShopGoodLimit;

// The costs one of Paimon's Bargains' sets is sold at each time: the items it is bought with and how many of each, and how many
// Of the set a player may buy in a refresh, and when that limit comes back
export interface PaimonsBargainsPrice {
  buyLimit: number;
  costs: ShopGoodCost[];
  refresh: ShopRefresh;
}

// Paimon's Bargains' rotation as the shops dataset holds it: the pairs of characters it offers in turn, by their avatar
// Ids, in the order the pairs come round, and the five weapons of each set, Blackcliff and Royal, by their weapon ids. Each
// Slot of the pair and of the set is bought as one good, by its goods id, and the characters and the weapons each have the
// Price their goods give
export interface PaimonsBargainsRotation {
  blackcliffWeaponIds: number[];
  characterGoodIds: number[];
  characterPairs: number[][];
  characterPrice: PaimonsBargainsPrice;
  royalWeaponIds: number[];
  weaponGoodIds: number[];
  weaponPrice: PaimonsBargainsPrice;
}

export const paimonsBargainsPriceSchema = z.object({
  buyLimit: z.int().nonnegative(),
  costs: z.array(shopGoodCostSchema).min(1),
  refresh: z.enum(ShopRefresh),
}) satisfies z.ZodType<PaimonsBargainsPrice>;

export const paimonsBargainsRotationSchema = z.object({
  blackcliffWeaponIds: z.array(z.int().positive()),
  characterGoodIds: z.array(z.int().positive()),
  characterPairs: z.array(z.array(z.int().positive())),
  characterPrice: paimonsBargainsPriceSchema,
  royalWeaponIds: z.array(z.int().positive()),
  weaponGoodIds: z.array(z.int().positive()),
  weaponPrice: paimonsBargainsPriceSchema,
}) satisfies z.ZodType<PaimonsBargainsRotation>;
