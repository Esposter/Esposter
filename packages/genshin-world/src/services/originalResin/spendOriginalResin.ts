import type { Wallet } from "#src/models/inventory/Wallet";
import type { ResinParam } from "#src/models/originalResin/ResinParam";

import { Currency } from "#src/models/inventory/Currency";
import { regenerateOriginalResin } from "#src/services/originalResin/regenerateOriginalResin";

// The wallet with `resin` of its Original Resin spent at `now`, or undefined where it holds less, and nothing is spent
export const spendOriginalResin = (
  wallet: Wallet,
  resin: number,
  now: Temporal.Instant,
  resinParam: ResinParam,
): undefined | Wallet => {
  const regeneratedWallet = regenerateOriginalResin(wallet, now, resinParam);
  const originalResin = regeneratedWallet[Currency.OriginalResin];
  if (originalResin < resin) return undefined;
  return { ...regeneratedWallet, [Currency.OriginalResin]: originalResin - resin };
};
