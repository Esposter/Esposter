import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { OfferingProgressSave } from "#src/models/offering/OfferingProgressSave";
import type { Ref, ShallowRef } from "vue";

import { offerBagItems } from "#src/services/offering/offerBagItems";
import { readFrostbearingTreeLevels } from "#src/services/offering/readFrostbearingTreeLevels";
import { getResultAsync } from "@esposter/shared";

// The Frostbearing Tree's offering: every offering item the bag holds is offered to it at once, its levels reached, their
// Adventure EXP gained at the Adventure Rank and their other rewards paid in, and the held count and level it keeps are
// The progress the save holds. Its levels are read from the game's table as an offer is made rather than with the world,
// And the bag is read once they have arrived, so an offer made while another's levels are still arriving offers the bag
// That one left
export const useWorldOfferings = ({
  frostbearingTreeProgress,
  gainWorldAdventureExp,
  gameDataBaseUrl,
  inventory,
  materialDataMap,
  nameText,
  setInventory,
  setWallet,
  wallet,
}: {
  frostbearingTreeProgress: ShallowRef<OfferingProgressSave>;
  gainWorldAdventureExp: (amount: number) => void;
  gameDataBaseUrl: string;
  inventory: Ref<Inventory>;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
  setInventory: (nextInventory: Inventory) => void;
  setWallet: (nextWallet: Wallet) => void;
  wallet: Ref<Wallet>;
}) => {
  // The rewards the bag has no room for come back as the offer's overflow, which no tree drops yet, so they are not kept.
  // Levels that fail to arrive are logged and the bag is left as it was
  const offerFrostbearingTree = () =>
    getResultAsync(() => readFrostbearingTreeLevels(gameDataBaseUrl)).match(
      (levels) => {
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
        frostbearingTreeProgress.value = { heldCount: offer.progress.heldCount, level: offer.progress.level };
      },
      (error) => {
        console.error(error);
      },
    );
  return { offerFrostbearingTree };
};
