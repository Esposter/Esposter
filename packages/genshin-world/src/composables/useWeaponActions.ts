import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { RarityRequiredExpsMap } from "#src/models/weapon/RarityRequiredExpsMap";
import type { Weapon } from "#src/models/weapon/Weapon";
import type { WeaponAscensionPhase } from "#src/models/weapon/WeaponAscensionPhase";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { ComputedRef, MaybeRefOrGetter, Ref } from "vue";

import { Currency } from "#src/models/inventory/Currency";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { takeInventoryEntry } from "#src/services/inventory/takeInventoryEntry";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";
import { takeItemCounts } from "#src/services/inventory/takeItemCounts";
import { ascendWeapon } from "#src/services/weapon/ascendWeapon";
import { enhanceWeapon } from "#src/services/weapon/enhanceWeapon";
import { getBagWeapon } from "#src/services/weapon/getBagWeapon";
import { getWeaponData } from "#src/services/weapon/getWeaponData";
import { refineWeapon } from "#src/services/weapon/refineWeapon";
import { setBagWeapon } from "#src/services/weapon/setBagWeapon";
import { getResult } from "@esposter/shared";
import { WeaponMenuTab } from "genshin-interface";
import { computed, toValue } from "vue";

// The bag and the wallet an accepted action leaves behind
interface ActionState {
  inventory: Inventory;
  wallet: Wallet;
}

interface WeaponActionsSource {
  // Clears the picks an accepted action spent
  clearPicks: () => void;
  // The bag entry of the weapon the screen opens on, which an accepted action writes the weapon back into
  entryId: MaybeRefOrGetter<number>;
  // The adventure rank the player holds when the action is pressed, which an Ascend's next phase requires
  getAdventureRank: () => number;
  // The bag and the wallet an accepted action writes back
  inventory: Ref<Inventory>;
  // Whether the bag holds the refinement material, which a refinement can take in place of a copy
  isRefinementMaterialHeld: ComputedRef<boolean>;
  // The game's material table by item id, which the ores and the refinement material are named from
  materialDataMap: MaybeRefOrGetter<ReadonlyMap<number, MaterialData>>;
  // The names the stat tables cite, in the reader's language, by their text id
  nameText: MaybeRefOrGetter<Readonly<Record<string, string>>>;
  // The weapon's next ascension phase, whose price the Ascend tab's Required line shows
  nextPhase: ComputedRef<undefined | WeaponAscensionPhase>;
  // The tab the screen is on, whose action is pressed and priced
  openTab: ComputedRef<WeaponMenuTab>;
  // The copy the Refine tab picks, which a refinement takes in place of the refinement material
  pickedCopyId: Ref<number | undefined>;
  // The bag entries of the fodder weapons the Enhance tab picks
  pickedFodderIds: Ref<number[]>;
  // The ores the Enhance tab picks, each count taken from the bag when it is enhanced
  pickedOres: Ref<ItemCount[]>;
  // The EXP each rarity needs to rise past each level
  rarityRequiredExpsMap: MaybeRefOrGetter<RarityRequiredExpsMap>;
  // The Mora and the other currencies every action spends from
  wallet: Ref<Wallet>;
  // The weapon the screen opens on, read from its bag entry
  weapon: ComputedRef<Weapon>;
  // The game data of the weapon the screen opens on, which its ascension, enhancement and refinement are read from
  weaponData: ComputedRef<WeaponData>;
  // Every weapon's game data by its id, which an enhancement's fodder weapons are read from
  weaponDataMap: MaybeRefOrGetter<ReadonlyMap<number, WeaponData>>;
}

// A refusal is the rule's answer and changes nothing, so it is logged and the weapon and the bag stay as they were
const reportRefusal = (error: Error) => {
  console.error(error);
};

// The weapon screen's action on its open tab, Ascend, Enhance or Refine: each one's bag and wallet transition when it is
// Accepted, the Mora it spends on the Required line, and whether its button is disabled
export const useWeaponActions = ({
  clearPicks,
  entryId,
  getAdventureRank,
  inventory,
  isRefinementMaterialHeld,
  materialDataMap,
  nameText,
  nextPhase,
  openTab,
  pickedCopyId,
  pickedFodderIds,
  pickedOres,
  rarityRequiredExpsMap,
  wallet,
  weapon,
  weaponData,
  weaponDataMap,
}: WeaponActionsSource) => {
  // Writes an accepted action's bag and wallet back and clears the picks it spent
  const applyActionState = ({ inventory: nextInventory, wallet: nextWallet }: ActionState) => {
    inventory.value = nextInventory;
    wallet.value = nextWallet;
    clearPicks();
  };
  // Levels the weapon with the picked ores and fodder weapons, which leave the bag, and returns the EXP past the cap as the
  // Ores it fills
  const enhanceAction = () =>
    getResult(() => {
      const fodders = pickedFodderIds.value.map((id) => {
        const fodder = getBagWeapon(inventory.value.items, id);
        return { data: getWeaponData(toValue(weaponDataMap), fodder.id), weapon: fodder };
      });
      const enhanced = enhanceWeapon(weapon.value, weaponData.value, toValue(rarityRequiredExpsMap), wallet.value, {
        fodders,
        ores: pickedOres.value,
      });
      const withoutFodders = pickedFodderIds.value.reduce(
        (bagItems, id) => takeInventoryEntry(bagItems, id),
        inventory.value.items,
      );
      const items = takeItemCounts(withoutFodders, pickedOres.value, 1);
      const returned = enhanced.returnedOres.reduce(
        (bag, { count, id }) =>
          addInventoryItem(bag, getItemDefinition(id, toValue(nameText), toValue(materialDataMap)), count).inventory,
        { ...inventory.value, items: setBagWeapon(items, toValue(entryId), enhanced.weapon) },
      );
      return { inventory: returned, wallet: enhanced.wallet };
    });
  // Ascends the weapon from its phase's cap, its Mora and items spent once the Adventure Rank allows it
  const ascendAction = () =>
    getResult(() => {
      const ascended = ascendWeapon(weapon.value, weaponData.value, {
        adventureRank: getAdventureRank(),
        inventory: inventory.value,
        wallet: wallet.value,
      });
      return {
        inventory: {
          ...ascended.inventory,
          items: setBagWeapon(ascended.inventory.items, toValue(entryId), ascended.weapon),
        },
        wallet: ascended.wallet,
      };
    });
  // Refines the weapon by the rank a picked copy holds, or by one for the refinement material; the copy or the material leaves
  // The bag with the rank's Mora paid
  const refineAction = () =>
    getResult(() => {
      const copyId = pickedCopyId.value;
      const gainedRanks = copyId === undefined ? 1 : getBagWeapon(inventory.value.items, copyId).refinement;
      const refined = refineWeapon(weapon.value, weaponData.value, wallet.value, gainedRanks);
      const items =
        copyId === undefined
          ? takeInventoryItems(inventory.value.items, weaponData.value.refinementMaterialId, 1)
          : takeInventoryEntry(inventory.value.items, copyId);
      return {
        inventory: { ...inventory.value, items: setBagWeapon(items, toValue(entryId), refined.weapon) },
        wallet: refined.wallet,
      };
    });
  // The open tab's action, pressed
  const act = () => {
    if (openTab.value === WeaponMenuTab.Ascend) ascendAction().match(applyActionState, reportRefusal);
    else if (openTab.value === WeaponMenuTab.Enhance) enhanceAction().match(applyActionState, reportRefusal);
    else if (openTab.value === WeaponMenuTab.Refine) refineAction().match(applyActionState, reportRefusal);
  };
  // The Mora the open tab's action spends, on the Required line: an Ascend's next phase price, and for the other two the Mora
  // Their accepted action would take, nothing where it is refused
  const pendingMora = computed(() => {
    if (openTab.value === WeaponMenuTab.Ascend) return nextPhase.value?.coinCost ?? 0;
    const action = openTab.value === WeaponMenuTab.Refine ? refineAction : enhanceAction;
    return action().match(
      (next) => wallet.value[Currency.Mora] - next.wallet[Currency.Mora],
      () => 0,
    );
  });
  const isActionDisabled = computed(() => {
    if (openTab.value === WeaponMenuTab.Enhance)
      return pickedOres.value.length === 0 && pickedFodderIds.value.length === 0;
    // A refinement takes the copy picked or else the material, so a weapon with neither has nothing to refine with
    if (openTab.value === WeaponMenuTab.Refine)
      return pickedCopyId.value === undefined && !isRefinementMaterialHeld.value;
    return false;
  });
  return { act, isActionDisabled, pendingMora };
};
