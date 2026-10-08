import type { Wallet } from "#src/models/inventory/Wallet";

// A claim's result: the Adventure EXP after it, and the wallet with its Original Resin spent and the Mora its EXP paid
export interface OriginalResinClaim {
  adventureExp: number;
  wallet: Wallet;
}
