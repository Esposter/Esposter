<script setup lang="ts">
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { RarityRequiredExpsMap } from "#src/models/weapon/RarityRequiredExpsMap";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { GameText } from "genshin-text";

import WeaponScreenAscend from "#src/components/Weapon/Screen/Ascend/Index.vue";
import WeaponScreenCells from "#src/components/Weapon/Screen/Cells/Index.vue";
import WeaponScreenEnhance from "#src/components/Weapon/Screen/Enhance/Index.vue";
import WeaponScreenFooter from "#src/components/Weapon/Screen/Footer/Index.vue";
import WeaponScreenHeader from "#src/components/Weapon/Screen/Header/Index.vue";
import WeaponScreenRefine from "#src/components/Weapon/Screen/Refine/Index.vue";
import { useWeaponActions } from "#src/composables/useWeaponActions";
import { useWeaponPicks } from "#src/composables/useWeaponPicks";
import { useWeaponStats } from "#src/composables/useWeaponStats";
import { useWeaponTabs } from "#src/composables/useWeaponTabs";
import { Currency } from "#src/models/inventory/Currency";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { getBagWeapon } from "#src/services/weapon/getBagWeapon";
import { getRarityRequiredExps } from "#src/services/weapon/getRarityRequiredExps";
import { getWeaponData } from "#src/services/weapon/getWeaponData";
import { getWeaponMaxLevel } from "#src/services/weapon/getWeaponMaxLevel";
import { WeaponTypeNameGameTextKeyMap } from "#src/services/weapon/WeaponTypeNameGameTextKeyMap";
import { GameScreen, WeaponMenu, WeaponMenuTab } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

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
  // The growth curves a weapon's base ATK and secondary attribute are read along, by each curve's name
  weaponGrowCurveMap: ReadonlyMap<string, readonly number[]>;
}

const inventory = defineModel<Inventory>("inventory", { required: true });
const tab = defineModel<WeaponMenuTab>("tab", { required: true });
const wallet = defineModel<Wallet>("wallet", { required: true });
const {
  adventureRank,
  entryId,
  gameText,
  materialDataMap,
  nameText,
  rarityRequiredExpsMap,
  weaponDataMap,
  weaponGrowCurveMap,
} = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
// The weapon the screen opens on, read from its bag entry, where its state is kept
const weapon = computed(() => getBagWeapon(inventory.value.items, entryId));
const weaponData = computed(() => getWeaponData(weaponDataMap, weapon.value.id));
const maxLevel = computed(() => getWeaponMaxLevel(weaponDataMap, weapon.value));
// The weapon's next ascension phase, whose cap, materials and Mora the Ascend tab reads
const nextPhase = computed(() => weaponData.value.ascensionPhases[weapon.value.ascension + 1]);
const { menuTabs, openTab, tabLabels } = useWeaponTabs(
  tab,
  weapon,
  () => weaponDataMap,
  () => gameText,
);
const name = computed(() => nameText[weaponData.value.nameTextId] || "");
const { baseAttackText, nextBaseAttackText, secondaryLabel, secondaryText } = useWeaponStats(
  weapon,
  weaponData,
  () => weaponGrowCurveMap,
  () => gameText,
);
const getItemName = (id: number) => getItemDefinition(id, nameText, materialDataMap).name;
// The level text a bag weapon's entry shows in its slot, at its own phase's cap
const getEntryLevelText = (id: number) => {
  const entry = getBagWeapon(inventory.value.items, id);
  return fillGameTextValues(
    gameText[GameTextKey.LevelFormat],
    `${entry.level}/${getWeaponMaxLevel(weaponDataMap, entry)}`,
  );
};
const {
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
} = useWeaponPicks({ entryId: () => entryId, getEntryLevelText, getItemName, inventory, weapon, weaponData });
// The next phase's ascension materials, each with what the bag holds of it, and its rarity
const nextPhaseCosts = computed(() =>
  (nextPhase.value?.costItems ?? []).map(({ count, id }) => {
    const definition = getItemDefinition(id, nameText, materialDataMap);
    return {
      count,
      id,
      name: definition.name,
      ownedCount: countInventoryItem(inventory.value.items, id),
      rarity: definition.rarity,
    };
  }),
);
const { act, isActionDisabled, pendingMora } = useWeaponActions({
  clearPicks,
  entryId: () => entryId,
  getAdventureRank: () => adventureRank,
  inventory,
  isRefinementMaterialHeld,
  materialDataMap: () => materialDataMap,
  nameText: () => nameText,
  nextPhase,
  openTab,
  pickedCopyId,
  pickedFodderIds,
  pickedOres,
  rarityRequiredExpsMap: () => rarityRequiredExpsMap,
  wallet,
  weapon,
  weaponData,
  weaponDataMap: () => weaponDataMap,
});
</script>

<template>
  <!-- The weapon screen, a dialog over the world, on the game's 1920 by 864 reference: the open tab's header (its level and EXP, its
       ascension phases, or its refinement rank), its panel (the ores and fodder weapons, the ascension materials or the refinement
       slots), the Required line's Mora and the tab's action beneath. The weapon's rarity and refinement rank are read aloud beside
       the picture -->
  <GameScreen class="weapon-screen" role="dialog" aria-modal="true" :aria-label="name">
    <!-- The weapon's kind in the reader's language, the word its header puts before the slash -->
    <WeaponMenu
      v-model:tab="openTab"
      :action-label="tabLabels[openTab]"
      :close-label="gameText[GameTextKey.Back]"
      :details-label="gameText[GameTextKey.CharacterDetails]"
      :is-action-disabled
      :kind="gameText[WeaponTypeNameGameTextKeyMap[weaponData.weaponType]]"
      :name
      :tabs="menuTabs"
      @action="act()"
      @close="emit('close')"
    >
      <WeaponScreenHeader
        :game-text="gameText"
        :mora="wallet[Currency.Mora]"
        :open-tab="openTab"
        :rarity="weaponData.rarity"
        :refinement="weapon.refinement"
      />
      <WeaponScreenFooter :game-text="gameText" :pending-mora="pendingMora" />
      <!-- The EXP the weapon's level takes to rise past, which the Enhance header sets beside the EXP the weapon holds -->
      <WeaponScreenEnhance
        v-if="openTab === WeaponMenuTab.Enhance"
        :base-attack-text="baseAttackText"
        :game-text="gameText"
        :max-level="maxLevel"
        :picked-material-count="pickedMaterialCount"
        :required-exp="getRarityRequiredExps(rarityRequiredExpsMap, weaponData.rarity)[weapon.level - 1] ?? 0"
        :secondary-label="secondaryLabel"
        :secondary-text="secondaryText"
        :weapon="weapon"
      />
      <WeaponScreenAscend
        v-else-if="openTab === WeaponMenuTab.Ascend"
        :base-attack-text="baseAttackText"
        :costs="nextPhaseCosts"
        :game-text="gameText"
        :max-level="maxLevel"
        :next-base-attack-text="nextBaseAttackText"
        :next-max-level="nextPhase?.maxLevel ?? maxLevel"
        :secondary-label="secondaryLabel"
        :secondary-text="secondaryText"
        :weapon="weapon"
      />
      <WeaponScreenRefine
        v-if="openTab === WeaponMenuTab.Refine"
        :game-text="gameText"
        :name-text="nameText"
        :refinement="weapon.refinement"
        :weapon-data="weaponData"
      />
      <WeaponScreenCells
        v-if="openTab !== WeaponMenuTab.Ascend"
        :copy-cells="copyCells"
        :fodder-cells="fodderCells"
        :is-refinement-material-held="isRefinementMaterialHeld"
        :ore-cells="oreCells"
        :open-tab="openTab"
        :picked-copy-id="pickedCopyId"
        :refine-slot-count="weaponData.refinementCosts.length"
        :refinement-material="refinementMaterial"
        @pick-copy="(id) => pickCopy(id)"
        @pick-material="pickRefinementMaterial()"
        @pick-ore="(id) => pickOre(id)"
        @toggle-fodder="(id) => toggleFodder(id)"
        @unpick-ore="(id) => unpickOre(id)"
      />
    </WeaponMenu>
  </GameScreen>
</template>

<style scoped>
/* The still is 1920 by 864, so its frame spans 2400 units at the height's unit, the width the unit fits in a window */
.weapon-screen {
  --game-design-width: 2400;
}
</style>
