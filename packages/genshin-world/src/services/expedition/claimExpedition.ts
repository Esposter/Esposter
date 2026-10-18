import type { Expedition } from "#src/models/expedition/Expedition";
import type { ExpeditionClaim } from "#src/models/expedition/ExpeditionClaim";
import type { ExpeditionPassive } from "#src/models/expedition/ExpeditionPassive";
import type { ExpeditionPlace } from "#src/models/expedition/ExpeditionPlace";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { checkIsExpeditionReturned } from "#src/services/expedition/checkIsExpeditionReturned";
import { computeExpeditionPassives } from "#src/services/expedition/computeExpeditionPassives";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { drawRewardItems } from "#src/services/reward/drawRewardItems";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The state after a character's returned expedition is claimed at `now`: each item of its duration drawn to a count in
// Its range by `random`, each count raised by the percent the talents of the character sent add to it, the Mora into the
// Wallet and the rest into the bag, the expedition taken off the list. Undefined where the character is not out, its time
// Is not yet out (its talents shorten the time it takes, in the place's region), or the bag cannot take every item whole
export const claimExpedition = (
  expeditions: readonly Expedition[],
  characterId: number,
  place: ExpeditionPlace,
  inventory: Inventory,
  wallet: Wallet,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
  now: Temporal.Instant,
  random: () => number,
  passives: readonly ExpeditionPassive[] = [],
): ExpeditionClaim | undefined => {
  const expedition = expeditions.find((expeditionAway) => expeditionAway.characterId === characterId);
  if (!expedition || expedition.placeId !== place.id) return undefined;
  const { rewardPercent, timeReductionPercent } = computeExpeditionPassives(passives, place.region, expedition.hours);
  if (!checkIsExpeditionReturned(expedition, now, timeReductionPercent)) return undefined;
  const duration = place.durations.find(({ hours }) => hours === expedition.hours);
  if (!duration)
    throw new InvalidOperationError(Operation.Read, String(place.id), `offers no ${expedition.hours} hours`);
  let claimedInventory = inventory;
  let moraCount = 0;
  for (const { count, id } of drawRewardItems(duration.items, random)) {
    const boostedCount = Math.round((count * (100 + rewardPercent)) / 100);
    if (id === MORA_ITEM_ID) moraCount += boostedCount;
    else {
      const addition = addInventoryItem(claimedInventory, getItemDefinition(id, names, materialDataMap), boostedCount);
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
