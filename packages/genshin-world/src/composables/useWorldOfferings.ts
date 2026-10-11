import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { OfferingLevel } from "#src/models/offering/OfferingLevel";
import type { OfferingProgressSave } from "#src/models/offering/OfferingProgressSave";
import type { Ref, ShallowRef } from "vue";

import { offerBagItems } from "#src/services/offering/offerBagItems";

// The Frostbearing Tree's offering: every offering item the bag holds is offered to it at once, its levels reached and
// Their rewards paid in, and the held count and level it keeps are the progress the save holds
export const useWorldOfferings = ({
  frostbearingTreeLevels,
  frostbearingTreeProgress,
  inventory,
  materialDataMap,
  nameText,
  setInventory,
  setWallet,
  wallet,
}: {
  frostbearingTreeLevels: OfferingLevel[];
  frostbearingTreeProgress: ShallowRef<OfferingProgressSave>;
  inventory: Ref<Inventory>;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
  setInventory: (nextInventory: Inventory) => void;
  setWallet: (nextWallet: Wallet) => void;
  wallet: Ref<Wallet>;
}) => {
  // The rewards the bag has no room for come back as the offer's overflow, which no tree drops yet, so they are not kept
  const offerFrostbearingTree = () => {
    const offer = offerBagItems(
      inventory.value,
      wallet.value,
      { ...frostbearingTreeProgress.value, levels: frostbearingTreeLevels },
      nameText,
      materialDataMap,
    );
    setInventory(offer.inventory);
    setWallet(offer.wallet);
    frostbearingTreeProgress.value = { heldCount: offer.progress.heldCount, level: offer.progress.level };
  };
  return { offerFrostbearingTree };
};
