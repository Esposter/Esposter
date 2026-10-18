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
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";
import { ascendWeapon } from "#src/services/weapon/ascendWeapon";
import { ENHANCEMENT_ORES } from "#src/services/weapon/constants";
import { enhanceWeapon } from "#src/services/weapon/enhanceWeapon";
import { getRarityRequiredExps } from "#src/services/weapon/getRarityRequiredExps";
import { getWeaponActions } from "#src/services/weapon/getWeaponActions";
import { getWeaponPassive } from "#src/services/weapon/getWeaponPassive";
import { refineWeapon } from "#src/services/weapon/refineWeapon";
import { getResult } from "@esposter/shared";
import { GameScreen, WeaponMenu, WeaponMenuTab } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The adventure rank the player holds, which an Ascend's next phase requires
  adventureRank: number;
  // The game's words in the reader's language
  gameText: GameText;
  // The game's material table by item id, which the ores and the refinement material are named from
  materialDataMap: ReadonlyMap<number, MaterialData>;
  // The names the stat tables cite, in the reader's language, by their text id
  nameText: Readonly<Record<string, string>>;
  // The EXP each rarity needs to rise past each level
  rarityRequiredExpsMap: RarityRequiredExpsMap;
  // The weapon's game data: its name, rarity, ascension phases and refinement costs
  weaponData: WeaponData;
}

// The weapon and the bag and wallet an action spends from, as the rule leaves them once it is accepted
interface WeaponState {
  inventory: Inventory;
  wallet: Wallet;
  weapon: Weapon;
}

const inventory = defineModel<Inventory>("inventory", { required: true });
const tab = defineModel<WeaponMenuTab>("tab", { required: true });
const wallet = defineModel<Wallet>("wallet", { required: true });
const weapon = defineModel<Weapon>("weapon", { required: true });
const { adventureRank, gameText, materialDataMap, nameText, rarityRequiredExpsMap, weaponData } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
// The tabs a weapon offers: Enhance always, Ascend only at its phase's cap, and Refine only where its rank can still rise
const getOfferedTabs = (target: Weapon): WeaponMenuTab[] => {
  const { canAscend, canRefine } = getWeaponActions(target, weaponData);
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
// The EXP the weapon holds towards the next level over what that level takes; a weapon at its cap has no next level
const requiredExps = computed(() => getRarityRequiredExps(rarityRequiredExpsMap, weaponData.rarity));
const maxLevel = computed(() => weaponData.ascensionPhases[weapon.value.ascension]?.maxLevel ?? weapon.value.level);
const isAtCap = computed(() => weapon.value.level >= maxLevel.value);
const requiredExp = computed(() => requiredExps.value[weapon.value.level - 1] ?? 0);
const experienceText = computed(() => (isAtCap.value ? "" : `${weapon.value.experience}/${requiredExp.value}`));
const experienceRatio = computed(() =>
  isAtCap.value || requiredExp.value === 0 ? 0 : weapon.value.experience / requiredExp.value,
);
const levelText = computed(() =>
  fillGameTextValues(gameText[GameTextKey.LevelFormat], `${weapon.value.level}/${maxLevel.value}`),
);
const name = computed(() => nameText[weaponData.nameTextId] || "");
// The passive the screen lists beneath the ores, its rank the weapon holds marked
const passive = computed(() => getWeaponPassive(weaponData, weapon.value.refinement, nameText));
// The ores the player picks for the next enhancement, each count taken from the bag when it is enhanced
const pickedOres = ref<ItemCount[]>([]);
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
// The refinement material the Refine tab offers, which a copy stands in for only where the weapon has none of its own
const refinementMaterial = computed(() => {
  if (weaponData.refinementMaterialId === 0) return undefined;
  return {
    count: countInventoryItem(inventory.value.items, weaponData.refinementMaterialId),
    name: getItemDefinition(weaponData.refinementMaterialId, nameText, materialDataMap).name,
  };
});
const actionLabel = computed(() => tabLabels.value[tab.value]);
const isActionDisabled = computed(() => {
  if (tab.value === WeaponMenuTab.Enhance) return pickedOres.value.length === 0;
  // A weapon whose rank a copy alone raises has no material to press, and a bag holding none has nothing to spend
  if (tab.value === WeaponMenuTab.Refine) return !refinementMaterial.value || refinementMaterial.value.count === 0;
  return false;
});
// Writes an accepted action back into the bag, the wallet and the weapon, and leaves the tab when the weapon no longer offers it
const applyWeaponState = (state: WeaponState) => {
  inventory.value = state.inventory;
  wallet.value = state.wallet;
  weapon.value = state.weapon;
  if (!getOfferedTabs(state.weapon).includes(tab.value)) tab.value = WeaponMenuTab.Enhance;
};
// A refusal is the rule's answer and changes nothing, so it is logged and the weapon and the bag stay as they were
const reportRefusal = (error: Error) => console.error(error);
// Levels the weapon with the picked ores, which leave the bag, and returns the EXP past the cap as the ores it fills
const enhance = () =>
  getResult(() => {
    const enhanced = enhanceWeapon(weapon.value, weaponData, rarityRequiredExpsMap, wallet.value, {
      fodders: [],
      ores: pickedOres.value,
    });
    const items = pickedOres.value.reduce(
      (bagItems, { count, id }) => takeInventoryItems(bagItems, id, count),
      inventory.value.items,
    );
    const returned = enhanced.returnedOres.reduce(
      (bag, { count, id }) => addInventoryItem(bag, getItemDefinition(id, nameText, materialDataMap), count).inventory,
      { ...inventory.value, items },
    );
    return { inventory: returned, wallet: enhanced.wallet, weapon: enhanced.weapon };
  }).match((state) => {
    applyWeaponState(state);
    pickedOres.value = [];
  }, reportRefusal);
// Ascends the weapon from its phase's cap, its Mora and items spent once the Adventure Rank allows it
const ascend = () =>
  getResult(() =>
    ascendWeapon(weapon.value, weaponData, { adventureRank, inventory: inventory.value, wallet: wallet.value }),
  ).match(applyWeaponState, reportRefusal);
// Refines the weapon by one rank for its refinement material, which leaves the bag with the rank's Mora paid
const refine = () =>
  getResult(() => {
    const refined = refineWeapon(weapon.value, weaponData, wallet.value, 1);
    return {
      inventory: {
        ...inventory.value,
        items: takeInventoryItems(inventory.value.items, weaponData.refinementMaterialId, 1),
      },
      wallet: refined.wallet,
      weapon: refined.weapon,
    };
  }).match(applyWeaponState, reportRefusal);
// The open tab's action, pressed
const act = () => {
  if (tab.value === WeaponMenuTab.Ascend) ascend();
  else if (tab.value === WeaponMenuTab.Enhance) enhance();
  else if (tab.value === WeaponMenuTab.Refine) refine();
};
</script>

<template>
  <!-- The weapon screen, a dialog over the world: the weapon's name, rarity, level, EXP towards the next level, phase and
       refinement rank, the open tab's panel of ores or of the refinement material, the passive's ranks beneath them, and
       the tab's action beneath -->
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
      <div v-if="tab === WeaponMenuTab.Enhance" class="ores">
        <div v-for="ore of oreCells" :key="ore.id" class="ore">
          <button class="pick" :disabled="ore.pickedCount >= ore.ownedCount" type="button" @click="pickOre(ore.id)">
            <span class="ore-name">{{ ore.name }}</span>
            <span class="ore-count">{{ ore.pickedCount }}/{{ ore.ownedCount }}</span>
          </button>
          <button class="unpick" :disabled="ore.pickedCount === 0" type="button" @click="unpickOre(ore.id)">−</button>
        </div>
      </div>
      <div v-else-if="tab === WeaponMenuTab.Refine && refinementMaterial" class="materials">
        <p class="material">
          <span class="ore-name">{{ refinementMaterial.name }}</span>
          <span class="ore-count">{{ refinementMaterial.count }}</span>
        </p>
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
.materials {
  position: absolute;
  top: calc(var(--unit) * 150);
  left: 0;
  display: flex;
  gap: calc(var(--unit) * 16);
}

.ore {
  display: flex;
  width: calc(var(--unit) * 123);
  height: calc(var(--unit) * 150);
  flex-direction: column;
}

.pick,
.material {
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

.material {
  width: calc(var(--unit) * 123);
  height: calc(var(--unit) * 150);
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
