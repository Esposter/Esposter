import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { Weapon } from "#src/models/weapon/Weapon";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { ComputedRef, MaybeRefOrGetter, Ref } from "vue";

import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { ENHANCEMENT_ORES } from "#src/services/weapon/constants";
import { ItemCategory } from "genshin-interface";
import { computed, ref, toValue } from "vue";

interface WeaponPicksSource {
  // The bag entry of the weapon the screen opens on, which the bag's other weapons leave out
  entryId: MaybeRefOrGetter<number>;
  // The level text a bag weapon's entry shows in its slot
  getEntryLevelText: (id: number) => string;
  // The name the game's table gives an item, in the reader's language
  getItemName: (id: number) => string;
  inventory: Ref<Inventory>;
  weapon: ComputedRef<Weapon>;
  weaponData: ComputedRef<WeaponData>;
}

// The picks the player makes on the Enhance and Refine panels, the cells they are drawn in, and the state each pick takes
export const useWeaponPicks = ({
  entryId,
  getEntryLevelText,
  getItemName,
  inventory,
  weapon,
  weaponData,
}: WeaponPicksSource) => {
  // The ores the player picks for the next enhancement, each count taken from the bag when it is enhanced
  const pickedOres = ref<ItemCount[]>([]);
  // The bag entries of the fodder weapons the player picks, and the copy the Refine tab picks, which stands in for the material
  const pickedFodderIds = ref<number[]>([]);
  const pickedCopyId = ref<number>();
  const oreCells = computed(() =>
    ENHANCEMENT_ORES.map(({ id }) => ({
      id,
      name: getItemName(id),
      ownedCount: countInventoryItem(inventory.value.items, id),
      pickedCount: pickedOres.value.find((ore) => ore.id === id)?.count ?? 0,
    })),
  );
  const setOrePick = (id: number, count: number) => {
    pickedOres.value = [...pickedOres.value.filter((ore) => ore.id !== id), ...(count > 0 ? [{ count, id }] : [])];
  };
  // Picks one more of an ore the bag holds, or gives one back
  const pickOre = (id: number) => {
    const ore = oreCells.value.find((oreCell) => oreCell.id === id);
    if (ore && ore.pickedCount < ore.ownedCount) setOrePick(id, ore.pickedCount + 1);
  };
  const unpickOre = (id: number) => {
    const ore = oreCells.value.find((oreCell) => oreCell.id === id);
    if (ore && ore.pickedCount > 0) setOrePick(id, ore.pickedCount - 1);
  };
  const toggleFodder = (id: number) => {
    pickedFodderIds.value = pickedFodderIds.value.includes(id)
      ? pickedFodderIds.value.filter((fodderId) => fodderId !== id)
      : [...pickedFodderIds.value, id];
  };
  const pickCopy = (id: number) => {
    pickedCopyId.value = pickedCopyId.value === id ? undefined : id;
  };
  // The material stands in for a copy, so picking it clears the copy the Refine tab holds
  const pickRefinementMaterial = () => {
    pickedCopyId.value = undefined;
  };
  // The bag's other weapons, each a fodder the Enhance tab picks by its entry, and the copies among them the Refine tab offers
  const bagWeapons = computed(() =>
    inventory.value.items.filter(
      (item) => item.definition.category === ItemCategory.Weapon && item.id !== toValue(entryId),
    ),
  );
  const fodderCells = computed(() =>
    bagWeapons.value.map((item) => ({
      id: item.id,
      levelText: getEntryLevelText(item.id),
      name: item.definition.name,
      picked: pickedFodderIds.value.includes(item.id),
    })),
  );
  const copyCells = computed(() =>
    bagWeapons.value
      .filter((item) => item.definition.id === weapon.value.id)
      .map((item) => ({ id: item.id, levelText: getEntryLevelText(item.id), name: item.definition.name })),
  );
  // The refinement material the Refine tab offers, which a copy stands in for where the player picks one
  const refinementMaterial = computed(() => {
    if (weaponData.value.refinementMaterialId === 0) return undefined;
    return {
      count: countInventoryItem(inventory.value.items, weaponData.value.refinementMaterialId),
      name: getItemName(weaponData.value.refinementMaterialId),
    };
  });
  // Whether the bag holds the refinement material at all, which a refinement can take in place of a copy
  const isRefinementMaterialHeld = computed(() => (refinementMaterial.value?.count ?? 0) > 0);
  // The materials the Enhance tab holds picked, the ores' counts and the fodder weapons, which its consumed line counts
  const pickedMaterialCount = computed(
    () => pickedOres.value.reduce((count, ore) => count + ore.count, 0) + pickedFodderIds.value.length,
  );
  // Writes off the picks an accepted action spent
  const clearPicks = () => {
    pickedOres.value = [];
    pickedFodderIds.value = [];
    pickedCopyId.value = undefined;
  };
  return {
    clearPicks,
    copyCells,
    fodderCells,
    isRefinementMaterialHeld,
    oreCells,
    pickCopy,
    pickedCopyId,
    pickedFodderIds,
    pickedMaterialCount,
    pickedOres,
    pickOre,
    pickRefinementMaterial,
    refinementMaterial,
    toggleFodder,
    unpickOre,
  };
};
