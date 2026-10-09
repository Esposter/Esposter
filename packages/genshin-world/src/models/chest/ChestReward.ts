import type { ChestRange } from "#src/models/chest/ChestRange";

// What one chest of a kind gives its player straight to the wallet: the Primogems and the Mora each roll within their range
export interface ChestReward {
  mora: ChestRange;
  primogem: ChestRange;
}
