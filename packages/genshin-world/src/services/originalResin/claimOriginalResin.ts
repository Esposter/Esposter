import type { Wallet } from "#src/models/inventory/Wallet";
import type { OriginalResinClaim } from "#src/models/originalResin/OriginalResinClaim";

import { Currency } from "#src/models/inventory/Currency";
import { gainAdventureExp } from "#src/services/adventureRank/gainAdventureExp";
import { ADVENTURE_EXP_PER_RESIN } from "#src/services/originalResin/constants";
import { spendOriginalResin } from "#src/services/originalResin/spendOriginalResin";

// Claims a blossom's reward with `resin` of Original Resin spent at `now`. The claim gives five Adventure EXP a point,
// The Mora its EXP pays past rank 60 goes into the wallet. Undefined where the resin is not held, and nothing is spent
export const claimOriginalResin = (
  wallet: Wallet,
  resin: number,
  adventureExp: number,
  completedMainQuestIds: ReadonlySet<string>,
  now: Temporal.Instant,
): OriginalResinClaim | undefined => {
  const spentWallet = spendOriginalResin(wallet, resin, now);
  if (!spentWallet) return undefined;
  const gain = gainAdventureExp(adventureExp, resin * ADVENTURE_EXP_PER_RESIN, completedMainQuestIds);
  return {
    adventureExp: gain.adventureExp,
    wallet: { ...spentWallet, [Currency.Mora]: spentWallet[Currency.Mora] + gain.moraPaid },
  };
};
