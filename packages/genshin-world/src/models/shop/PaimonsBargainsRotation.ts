// Paimon's Bargains' rotation as the shops dataset holds it: the pairs of characters it offers in turn, by their avatar
// Ids, in the order the pairs come round, and the five weapons of each set, Blackcliff and Royal, by their weapon ids
export interface PaimonsBargainsRotation {
  blackcliffWeaponIds: number[];
  characterPairs: number[][];
  royalWeaponIds: number[];
}
