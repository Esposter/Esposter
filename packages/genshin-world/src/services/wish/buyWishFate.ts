import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { FATE_PRIMOGEM_COST } from "#src/services/wish/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The wallet after one Fate of the given kind is bought with Primogems, which the purchase takes at FATE_PRIMOGEM_COST.
// The purchase is refused when the wallet holds fewer Primogems than that
export const buyWishFate = (wallet: Wallet, fate: Currency): Wallet => {
  if (wallet[Currency.Primogem] < FATE_PRIMOGEM_COST)
    throw new InvalidOperationError(Operation.Update, buyWishFate.name, fate);
  return { ...wallet, [Currency.Primogem]: wallet[Currency.Primogem] - FATE_PRIMOGEM_COST, [fate]: wallet[fate] + 1 };
};
