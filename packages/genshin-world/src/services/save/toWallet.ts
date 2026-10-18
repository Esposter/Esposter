import type { Wallet } from "#src/models/inventory/Wallet";
import type { WalletSave } from "#src/models/inventory/WalletSave";

import { EMPTY_CURRENCIES } from "#src/services/inventory/constants";

// The save's instants and game day read back into the wallet's Temporal values, and a currency the save does not hold reads
// As zero
export const toWallet = ({
  currencies,
  originalResinChangedAt,
  primogemResinRefillCount,
  primogemResinRefillDay,
}: WalletSave): Wallet => ({
  ...EMPTY_CURRENCIES,
  ...currencies,
  originalResinChangedAt: Temporal.Instant.from(originalResinChangedAt),
  primogemResinRefillCount,
  primogemResinRefillDay: Temporal.PlainDate.from(primogemResinRefillDay),
});
