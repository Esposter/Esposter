// Paimon's Bargains' rotation as the shops dataset holds it: the pairs of characters it offers in turn, by their avatar
// Ids, in the order the pairs come round, and the five weapons of each set, Blackcliff and Royal, by their weapon ids. The
// Characters and the weapons each have the price their rotations' goods give
// The price one of Paimon's Bargains' sets is sold at each time: the item it is bought with and how many of it, and how
// Many of the set a player may buy in a month
export interface PaimonsBargainsPrice {
  buyLimit: number;
  priceCount: number;
  priceItemId: number;
}

export interface PaimonsBargainsRotation {
  blackcliffWeaponIds: number[];
  characterPairs: number[][];
  characterPrice: PaimonsBargainsPrice;
  royalWeaponIds: number[];
  weaponPrice: PaimonsBargainsPrice;
}
