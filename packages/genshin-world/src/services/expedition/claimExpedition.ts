import type { Expedition } from "#src/models/expedition/Expedition";
import type { ExpeditionClaim } from "#src/models/expedition/ExpeditionClaim";
import type { ExpeditionPlace } from "#src/models/expedition/ExpeditionPlace";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { checkIsExpeditionReturned } from "#src/services/expedition/checkIsExpeditionReturned";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The state after a character's returned expedition is claimed at `now`: each item of its duration drawn to a count in
// Its range by `random`, the Mora into the wallet and the rest into the bag, the expedition taken off the list. Undefined
// Where the character is not out, its time is not yet out, or the bag cannot take every item whole, which keeps it out
export const claimExpedition = (
  expeditions: readonly Expedition[],
  characterId: number,
  place: ExpeditionPlace,
  inventory: Inventory,
  wallet: Wallet,
  names: Readonly<Record<string, string>>,
  now: Temporal.Instant,
  random: () => number,
): ExpeditionClaim | undefined => {
  const expedition = expeditions.find((expeditionAway) => expeditionAway.characterId === characterId);
  if (!expedition || expedition.placeId !== place.id || !checkIsExpeditionReturned(expedition, now)) return undefined;
  const duration = place.durations.find(({ hours }) => hours === expedition.hours);
  if (!duration)
    throw new InvalidOperationError(Operation.Read, String(place.id), `offers no ${expedition.hours} hours`);
  let claimedInventory = inventory;
  let moraCount = 0;
  for (const { itemId, maxCount, minCount } of duration.items) {
    const count = minCount + Math.floor(random() * (maxCount - minCount + 1));
    if (itemId === MORA_ITEM_ID) moraCount += count;
    else {
      const addition = addInventoryItem(claimedInventory, getItemDefinition(itemId, names), count);
      if (addition.overflow > 0) return undefined;
      claimedInventory = addition.inventory;
    }
  }
  return {
    expeditions: expeditions.filter((expeditionAway) => expeditionAway.characterId !== characterId),
    inventory: claimedInventory,
    wallet: { ...wallet, [Currency.Mora]: wallet[Currency.Mora] + moraCount },
  };
};
