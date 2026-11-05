import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { gainAdventureExp } from "#src/services/adventureRank/gainAdventureExp";
import { grantRewardItems } from "#src/services/reward/grantRewardItems";

// The routing every claim's rewards share: the Adventure EXP the claim gives, taken into the rank with the Mora its EXP
// Pays past rank 60 going into the wallet, and the items taken in as `grantRewardItems` takes them. The Adventure EXP is
// The caller's amount, the EXP its resin spent gives or the EXP its items hold, and is not read off the items here. The
// Companionship EXP is the caller's too, since it goes to the deployed team, which this does not hold. Undefined where the
// Bag cannot take an item whole, so nothing is routed
export const routeRewardItems = (
  adventureRankTables: AdventureRankTables,
  adventureExp: number,
  gainedAdventureExp: number,
  completedMainQuestIds: ReadonlySet<string>,
  wallet: Wallet,
  inventory: Inventory,
  items: readonly ItemCount[],
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): undefined | { adventureExp: number; inventory: Inventory; wallet: Wallet } => {
  const gain = gainAdventureExp(adventureRankTables, adventureExp, gainedAdventureExp, completedMainQuestIds);
  const granted = grantRewardItems(
    { ...wallet, [Currency.Mora]: wallet[Currency.Mora] + gain.moraPaid },
    inventory,
    items,
    names,
    materialDataMap,
  );
  if (!granted) return undefined;
  return { adventureExp: gain.adventureExp, ...granted };
};
