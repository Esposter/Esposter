<script setup lang="ts">
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { RarityRequiredExpsMap } from "#src/models/weapon/RarityRequiredExpsMap";
import type { Weapon } from "#src/models/weapon/Weapon";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { GameText } from "genshin-text";

import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { takeInventoryEntry } from "#src/services/inventory/takeInventoryEntry";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";
import { ascendWeapon } from "#src/services/weapon/ascendWeapon";
import { ENHANCEMENT_ORES } from "#src/services/weapon/constants";
import { enhanceWeapon } from "#src/services/weapon/enhanceWeapon";
import { getBagWeapon } from "#src/services/weapon/getBagWeapon";
import { getRarityRequiredExps } from "#src/services/weapon/getRarityRequiredExps";
import { getWeaponActions } from "#src/services/weapon/getWeaponActions";
import { getWeaponPassive } from "#src/services/weapon/getWeaponPassive";
import { refineWeapon } from "#src/services/weapon/refineWeapon";
import { setBagWeapon } from "#src/services/weapon/setBagWeapon";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { GameScreen, ItemCategory, WeaponMenu, WeaponMenuTab } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

// The bag and the wallet an accepted action leaves behind
interface ActionState {
  inventory: Inventory;
  wallet: Wallet;
}

interface Props {
  // The adventure rank the player holds, which an Ascend's next phase requires
  adventureRank: number;
  // The bag entry of the weapon the screen opens on, which holds the weapon's level, EXP, ascension and refinement
  entryId: number;
  // The game's words in the reader's language
  gameText: GameText;
  // The game's material table by item id, which the ores and the refinement material are named from
  materialDataMap: ReadonlyMap<number, MaterialData>;
  // The names the stat tables cite, in the reader's language, by their text id
  nameText: Readonly<Record<string, string>>;
  // The EXP each rarity needs to rise past each level
  rarityRequiredExpsMap: RarityRequiredExpsMap;
  // Every weapon's game data by its id, which the open weapon, its fodder and its copies are read from
  weaponDataMap: ReadonlyMap<number, WeaponData>;
}

const inventory = defineModel<Inventory>("inventory", { required: true });
const tab = defineModel<WeaponMenuTab>("tab", { required: true });
const wallet = defineModel<Wallet>("wallet", { required: true });
const { adventureRank, entryId, gameText, materialDataMap, nameText, rarityRequiredExpsMap, weaponDataMap } =
  defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
// A weapon's game data by its id, which every weapon the bag holds has
const getWeaponData = (id: number): WeaponData => {
  const data = weaponDataMap.get(id);
  if (!data) throw new InvalidOperationError(Operation.Read, "weapon screen", `weapon ${id} has no data`);
  return data;
};
// The weapon the screen opens on, read from its bag entry, where its state is kept
const weapon = computed(() => getBagWeapon(inventory.value.items, entryId));
const weaponData = computed(() => getWeaponData(weapon.value.id));
// The tabs a weapon offers: Enhance always, Ascend only at its phase's cap, and Refine only where its rank can still rise
const getOfferedTabs = (target: Weapon): WeaponMenuTab[] => {
  const { canAscend, canRefine } = getWeaponActions(target, getWeaponData(target.id));
  return [
    WeaponMenuTab.Enhance,
    ...(canAscend ? [WeaponMenuTab.Ascend] : []),
    ...(canRefine ? [WeaponMenuTab.Refine] : []),
  ];
};
const offeredTabs = computed(() => getOfferedTabs(weapon.value));
const tabLabels = computed((): Record<WeaponMenuTab, string> => ({
  [WeaponMenuTab.Ascend]: gameText[GameTextKey.WeaponAscend],
  [WeaponMenuTab.Enhance]: gameText[GameTextKey.WeaponEnhance],
  [WeaponMenuTab.Refine]: gameText[GameTextKey.WeaponRefine],
}));
const menuTabs = computed(() =>
  offeredTabs.value.map((menuTab) => ({ label: tabLabels.value[menuTab], tab: menuTab })),
);
// The level a weapon reaches in its phase, and the level text the game writes over it
const getMaxLevel = (target: Weapon) =>
  getWeaponData(target.id).ascensionPhases[target.ascension]?.maxLevel ?? target.level;
const getLevelText = (target: Weapon) =>
  fillGameTextValues(gameText[GameTextKey.LevelFormat], `${target.level}/${getMaxLevel(target)}`);
// The EXP the weapon holds towards the next level over what that level takes; a weapon at its cap has no next level
const requiredExps = computed(() => getRarityRequiredExps(rarityRequiredExpsMap, weaponData.value.rarity));
const maxLevel = computed(() => getMaxLevel(weapon.value));
const isAtCap = computed(() => weapon.value.level >= maxLevel.value);
const requiredExp = computed(() => requiredExps.value[weapon.value.level - 1] ?? 0);
const experienceText = computed(() => (isAtCap.value ? "" : `${weapon.value.experience}/${requiredExp.value}`));
const experienceRatio = computed(() =>
  isAtCap.value || requiredExp.value === 0 ? 0 : weapon.value.experience / requiredExp.value,
);
const levelText = computed(() => getLevelText(weapon.value));
const name = computed(() => nameText[weaponData.value.nameTextId] || "");
// The passive the screen lists beneath the ores, its rank the weapon holds marked
const passive = computed(() => getWeaponPassive(weaponData.value, weapon.value.refinement, nameText));
// The ores the player picks for the next enhancement, each count taken from the bag when it is enhanced
const pickedOres = ref<ItemCount[]>([]);
// The bag entries of the fodder weapons the player picks, and the copy the Refine tab picks, which stands in for the material
const pickedFodderIds = ref<number[]>([]);
const pickedCopyId = ref<number>();
const oreCells = computed(() =>
  ENHANCEMENT_ORES.map(({ id }) => ({
    id,
    name: getItemDefinition(id, nameText, materialDataMap).name,
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
// The bag's other weapons, each a fodder the Enhance tab picks by its entry, and the copies among them the Refine tab offers
const bagWeapons = computed(() =>
  inventory.value.items.filter((item) => item.definition.category === ItemCategory.Weapon && item.id !== entryId),
);
const fodderCells = computed(() =>
  bagWeapons.value.map((item) => ({
    id: item.id,
    levelText: getLevelText(getBagWeapon(inventory.value.items, item.id)),
    name: item.definition.name,
    picked: pickedFodderIds.value.includes(item.id),
  })),
);
const copyCells = computed(() =>
  bagWeapons.value
    .filter((item) => item.definition.id === weapon.value.id)
    .map((item) => ({ id: item.id, levelText: getLevelText(getBagWeapon(inventory.value.items, item.id)) })),
);
const pickCopy = (id: number) => {
  pickedCopyId.value = pickedCopyId.value === id ? undefined : id;
};
const pickMaterial = () => {
  pickedCopyId.value = undefined;
};
// The refinement material the Refine tab offers, which a copy stands in for where the player picks one
const refinementMaterial = computed(() => {
  if (weaponData.value.refinementMaterialId === 0) return undefined;
  return {
    count: countInventoryItem(inventory.value.items, weaponData.value.refinementMaterialId),
    name: getItemDefinition(weaponData.value.refinementMaterialId, nameText, materialDataMap).name,
  };
});
const actionLabel = computed(() => tabLabels.value[tab.value]);
const isActionDisabled = computed(() => {
  if (tab.value === WeaponMenuTab.Enhance) return pickedOres.value.length === 0 && pickedFodderIds.value.length === 0;
  // A refinement takes the copy picked or else the material, so a weapon with neither has nothing to refine with
  if (tab.value === WeaponMenuTab.Refine)
    return pickedCopyId.value === undefined && (!refinementMaterial.value || refinementMaterial.value.count === 0);
  return false;
});
// Writes an accepted action's bag and wallet back, clears the picks it spent, and leaves the tab when the weapon no longer offers it
const applyActionState = ({ inventory: nextInventory, wallet: nextWallet }: ActionState) => {
  inventory.value = nextInventory;
  wallet.value = nextWallet;
  pickedOres.value = [];
  pickedFodderIds.value = [];
  pickedCopyId.value = undefined;
  if (!getOfferedTabs(getBagWeapon(nextInventory.items, entryId)).includes(tab.value))
    tab.value = WeaponMenuTab.Enhance;
};
// A refusal is the rule's answer and changes nothing, so it is logged and the weapon and the bag stay as they were
const reportRefusal = (error: Error) => console.error(error);
// Levels the weapon with the picked ores and fodder weapons, which leave the bag, and returns the EXP past the cap as the
// Ores it fills
const enhance = () =>
  getResult(() => {
    const fodders = pickedFodderIds.value.map((id) => {
      const fodder = getBagWeapon(inventory.value.items, id);
      return { data: getWeaponData(fodder.id), weapon: fodder };
    });
    const enhanced = enhanceWeapon(weapon.value, weaponData.value, rarityRequiredExpsMap, wallet.value, {
      fodders,
      ores: pickedOres.value,
    });
    const withoutFodders = pickedFodderIds.value.reduce(
      (bagItems, id) => takeInventoryEntry(bagItems, id),
      inventory.value.items,
    );
    const items = pickedOres.value.reduce(
      (bagItems, { count, id }) => takeInventoryItems(bagItems, id, count),
      withoutFodders,
    );
    const returned = enhanced.returnedOres.reduce(
      (bag, { count, id }) => addInventoryItem(bag, getItemDefinition(id, nameText, materialDataMap), count).inventory,
      { ...inventory.value, items: setBagWeapon(items, entryId, enhanced.weapon) },
    );
    return { inventory: returned, wallet: enhanced.wallet };
  }).match(applyActionState, reportRefusal);
// Ascends the weapon from its phase's cap, its Mora and items spent once the Adventure Rank allows it
const ascend = () =>
  getResult(() => {
    const ascended = ascendWeapon(weapon.value, weaponData.value, {
      adventureRank,
      inventory: inventory.value,
      wallet: wallet.value,
    });
    return {
      inventory: { ...ascended.inventory, items: setBagWeapon(ascended.inventory.items, entryId, ascended.weapon) },
      wallet: ascended.wallet,
    };
  }).match(applyActionState, reportRefusal);
// Refines the weapon by the rank a picked copy holds, or by one for the refinement material; the copy or the material leaves
// The bag with the rank's Mora paid
const refine = () =>
  getResult(() => {
    const copyId = pickedCopyId.value;
    const gainedRanks = copyId === undefined ? 1 : getBagWeapon(inventory.value.items, copyId).refinement;
    const refined = refineWeapon(weapon.value, weaponData.value, wallet.value, gainedRanks);
    const items =
      copyId === undefined
        ? takeInventoryItems(inventory.value.items, weaponData.value.refinementMaterialId, 1)
        : takeInventoryEntry(inventory.value.items, copyId);
    return {
      inventory: { ...inventory.value, items: setBagWeapon(items, entryId, refined.weapon) },
      wallet: refined.wallet,
    };
  }).match(applyActionState, reportRefusal);
// The open tab's action, pressed
const act = () => {
  if (tab.value === WeaponMenuTab.Ascend) ascend();
  else if (tab.value === WeaponMenuTab.Enhance) enhance();
  else if (tab.value === WeaponMenuTab.Refine) refine();
};
</script>

<template>
  <!-- The weapon screen, a dialog over the world: the weapon's name, rarity, level, EXP towards the next level, phase and
       refinement rank, the open tab's panel of ores and fodder weapons or of copies and the refinement material, the
       passive's ranks beneath them, and the tab's action beneath -->
  <GameScreen role="dialog" aria-modal="true" :aria-label="name">
    <WeaponMenu
      v-model:tab="tab"
      :action-label
      :close-label="gameText[GameTextKey.Back]"
      :ascension="weapon.ascension"
      :experience-ratio
      :experience-text
      :is-action-disabled
      :level-text
      :name
      :rarity="weaponData.rarity"
      :refinement="weapon.refinement"
      :tabs="menuTabs"
      @action="act()"
      @close="emit('close')"
    >
      <template v-if="tab === WeaponMenuTab.Enhance">
        <div class="ores">
          <div v-for="ore of oreCells" :key="ore.id" class="ore">
            <button class="pick" :disabled="ore.pickedCount >= ore.ownedCount" type="button" @click="pickOre(ore.id)">
              <span class="ore-name">{{ ore.name }}</span>
              <span class="ore-count">{{ ore.pickedCount }}/{{ ore.ownedCount }}</span>
            </button>
            <button class="unpick" :disabled="ore.pickedCount === 0" type="button" @click="unpickOre(ore.id)">−</button>
          </div>
        </div>
        <!-- Provisional: the fodder row's place under the ores is not measured yet -->
        <div class="fodders">
          <button
            v-for="fodder of fodderCells"
            :key="fodder.id"
            class="pick"
            :aria-pressed="fodder.picked"
            type="button"
            @click="toggleFodder(fodder.id)"
          >
            <span class="ore-name">{{ fodder.name }}</span>
            <span class="ore-count">{{ fodder.levelText }}</span>
          </button>
        </div>
      </template>
      <div v-else-if="tab === WeaponMenuTab.Refine" class="materials">
        <button
          v-if="refinementMaterial"
          class="pick"
          :aria-pressed="pickedCopyId === undefined"
          type="button"
          @click="pickMaterial()"
        >
          <span class="ore-name">{{ refinementMaterial.name }}</span>
          <span class="ore-count">{{ refinementMaterial.count }}</span>
        </button>
        <button
          v-for="copy of copyCells"
          :key="copy.id"
          class="pick"
          :aria-pressed="pickedCopyId === copy.id"
          type="button"
          @click="pickCopy(copy.id)"
        >
          <span class="ore-count">{{ copy.levelText }}</span>
        </button>
      </div>
      <ul v-if="passive" class="passive">
        <li class="passive-name">{{ passive.name }}</li>
        <li v-for="(row, index) of passive.rows" :key="index" class="passive-row" :class="{ held: row.isHeld }">
          {{ row.description }}
        </li>
      </ul>
    </WeaponMenu>
  </GameScreen>
</template>

<style scoped>
/* The panel's pieces, measured off the same 7.1 Silver Light clip as the frame (captures/weapon-enhance-jXrYcFHiVnI.mp4,
   at 2 and 92 seconds, 1920 by 864 pixels, a pixel 1.25 units): the material slots 123 units wide and 150 high on a
   139-unit pitch from the panel's left at the slots' top. Their colours are provisional */
.ores,
.materials,
.fodders {
  position: absolute;
  left: 0;
  display: flex;
  gap: calc(var(--unit) * 16);
}

.ores,
.materials {
  top: calc(var(--unit) * 150);
}

.fodders {
  top: calc(var(--unit) * 316);
  flex-wrap: wrap;
}

.ore {
  display: flex;
  width: calc(var(--unit) * 123);
  height: calc(var(--unit) * 150);
  flex-direction: column;
}

.pick {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  margin: 0;
  padding: calc(var(--unit) * 12) calc(var(--unit) * 6);
  border: none;
  border-radius: calc(var(--unit) * 6);
  background: rgb(255 255 255 / 0.15);
  color: #fff;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 22);
  text-align: center;
}

.materials .pick,
.fodders .pick {
  flex: none;
  width: calc(var(--unit) * 123);
  height: calc(var(--unit) * 150);
}

.pick[aria-pressed="true"] {
  background: rgb(255 255 255 / 0.4);
}

.pick:disabled {
  color: rgb(255 255 255 / 0.4);
}

/* Provisional: the passive's place beneath the ore row is unmeasured, and its ranks are listed in refinement order */
.passive {
  position: absolute;
  top: calc(var(--unit) * 330);
  right: 0;
  left: 0;
  margin: 0;
  padding: 0;
  color: #fff;
  font-size: calc(var(--unit) * 22);
  list-style: none;
}

.passive-name {
  font-weight: 600;
}

.passive-row.held {
  color: #f0d27a;
}

.ore-count {
  color: #f0d27a;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
}

.unpick {
  height: calc(var(--unit) * 26);
  border: none;
  background: none;
  color: #fff;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 28);
  line-height: 1;
}
</style>
