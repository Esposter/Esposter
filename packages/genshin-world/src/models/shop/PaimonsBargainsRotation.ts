import type { ShopGood, ShopGoodLimit } from "#src/models/shop/ShopGood";

import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { z } from "zod";

// One character or weapon of Paimon's Bargains as a good: its goods id and limit, the id it gives (an avatar's for a
// Character, a weapon's for a weapon), how many it gives, and the price it is bought at. It has no sale dates, since the
// Rotation gives none, so it is always on offer while its month holds
export type PaimonsBargainsGood = Pick<ShopGood, "itemCount" | "itemId" | "priceCount" | "priceItemId"> & ShopGoodLimit;

// The price one of Paimon's Bargains' sets is sold at each time: the item it is bought with and how many of it, how many of
// The set a player may buy in a refresh, and when that limit comes back
export interface PaimonsBargainsPrice {
  buyLimit: number;
  priceCount: number;
  priceItemId: number;
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
  priceCount: z.int().nonnegative(),
  priceItemId: z.int().positive(),
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
