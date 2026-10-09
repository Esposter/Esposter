import type { Wallet } from "#src/models/inventory/Wallet";
import type { WalletSave } from "#src/models/inventory/WalletSave";

import { Currency } from "#src/models/inventory/Currency";

// The wallet's counts by currency, each listed so the save holds exactly the currencies the game counts
export const toWalletSave = (wallet: Wallet): WalletSave => ({
  currencies: {
    [Currency.AcquaintFate]: wallet[Currency.AcquaintFate],
    [Currency.GenesisCrystal]: wallet[Currency.GenesisCrystal],
    [Currency.IntertwinedFate]: wallet[Currency.IntertwinedFate],
    [Currency.MasterlessStardust]: wallet[Currency.MasterlessStardust],
    [Currency.MasterlessStarglitter]: wallet[Currency.MasterlessStarglitter],
    [Currency.MasterlessStellaFortuna]: wallet[Currency.MasterlessStellaFortuna],
    [Currency.Mora]: wallet[Currency.Mora],
    [Currency.OriginalResin]: wallet[Currency.OriginalResin],
    [Currency.Primogem]: wallet[Currency.Primogem],
  },
  originalResinChangedAt: wallet.originalResinChangedAt.toString(),
  primogemResinRefillCount: wallet.primogemResinRefillCount,
  primogemResinRefillDay: wallet.primogemResinRefillDay.toString(),
});
