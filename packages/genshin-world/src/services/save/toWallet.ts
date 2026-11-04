import type { Wallet } from "#src/models/inventory/Wallet";
import type { WalletSave } from "#src/models/inventory/WalletSave";

// The save's instants and game day read back into the wallet's Temporal values
export const toWallet = ({
  currencies,
  originalResinChangedAt,
  primogemResinRefillCount,
  primogemResinRefillDay,
}: WalletSave): Wallet => ({
  ...currencies,
  originalResinChangedAt: Temporal.Instant.from(originalResinChangedAt),
  primogemResinRefillCount,
  primogemResinRefillDay: Temporal.PlainDate.from(primogemResinRefillDay),
});
