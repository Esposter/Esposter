import type { ChestRange } from "#src/models/chest/ChestRange";

// What one chest of a kind gives its player: the Primogems and the Mora each roll within their range into the wallet,
// And the Adventure EXP is fixed and goes to the Adventure Rank, which the wallet does not hold
export interface ChestReward {
  adventureExp: number;
  mora: ChestRange;
  primogem: ChestRange;
}
