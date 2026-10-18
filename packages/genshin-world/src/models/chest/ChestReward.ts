import type { ChestRange } from "#src/models/chest/ChestRange";

// What one chest of a kind gives its player: the Primogems, the Mora and the region's Sigils each roll within their range
// Into the wallet, and the Adventure EXP is fixed and goes to the Adventure Rank, which the wallet does not hold
export interface ChestReward {
  adventureExp: number;
  mora: ChestRange;
  primogem: ChestRange;
  sigil: ChestRange;
}
