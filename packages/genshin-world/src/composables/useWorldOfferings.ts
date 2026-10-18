import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { FrostbearingTreePlace } from "#src/models/offering/FrostbearingTreePlace";
import type { OfferingProgressSave } from "#src/models/offering/OfferingProgressSave";
import type { WorldDrop } from "#src/models/world/WorldDrop";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { Ref, ShallowRef } from "vue";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { FROSTBEARING_TREE_OFFERING_ID } from "#src/services/offering/constants";
import { offerBagItems } from "#src/services/offering/offerBagItems";
import { readFrostbearingTreeLevels } from "#src/services/offering/readFrostbearingTreeLevels";
import { getResultAsync } from "@esposter/shared";

// The Frostbearing Tree's offering: every offering item the bag holds is offered to it at once, its levels reached, their
// Adventure EXP gained at the Adventure Rank and their other rewards paid in, what the bag has no room for dropped at the
// Tree as a pick up, and the held counts and level it keeps are
// The progress the save holds. Its levels are read from the game's table as an offer is made rather than with the world,
// And the bag is read once they have arrived, so an offer made while another's levels are still arriving offers the bag
// That one left
export const useWorldOfferings = ({
  events,
  frostbearingTreeProgress,
  gainWorldAdventureExp,
  gameDataBaseUrl,
  inventory,
  materialDataMap,
  nameText,
  placeWorldDrops,
  setInventory,
  setWallet,
  wallet,
}: {
  events: WorldEvents;
  frostbearingTreeProgress: ShallowRef<OfferingProgressSave>;
  gainWorldAdventureExp: (amount: number) => void;
  gameDataBaseUrl: string;
  inventory: Ref<Inventory>;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
  placeWorldDrops: (source: Pick<WorldDrop, "id" | "position">, droppedItems: DroppedItem[]) => void;
  setInventory: (nextInventory: Inventory) => void;
  setWallet: (nextWallet: Wallet) => void;
  wallet: Ref<Wallet>;
}) => {
  // Levels that fail to arrive are logged and the bag is left as it was
  const offerFrostbearingTree = (frostbearingTreePlace: FrostbearingTreePlace) =>
    getResultAsync(() => readFrostbearingTreeLevels(gameDataBaseUrl)).match(
      (levels) => {
        const previousLevel = frostbearingTreeProgress.value.level;
        const offer = offerBagItems(
          inventory.value,
          wallet.value,
          { ...frostbearingTreeProgress.value, levels },
          nameText,
          materialDataMap,
        );
        setInventory(offer.inventory);
        setWallet(offer.wallet);
        gainWorldAdventureExp(offer.adventureExp);
        placeWorldDrops(frostbearingTreePlace, offer.overflowItems);
        frostbearingTreeProgress.value = { heldCounts: offer.progress.heldCounts, level: offer.progress.level };
        // The tree's level reached is one doing, its quantity the level, which a level trigger reads against its own
        if (offer.progress.level > previousLevel)
          events.emit("achievementEvents", [
            {
              kind: AchievementEventKind.OfferingLevelReached,
              quantity: offer.progress.level,
              targetId: String(FROSTBEARING_TREE_OFFERING_ID),
            },
          ]);
      },
      (error) => {
        console.error(error);
      },
    );
  return { offerFrostbearingTree };
};
