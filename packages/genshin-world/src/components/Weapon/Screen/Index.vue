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
import { useWeaponPicks } from "#src/composables/useWeaponPicks";
import { useWeaponStats } from "#src/composables/useWeaponStats";
import { useWeaponTabs } from "#src/composables/useWeaponTabs";
import { Currency } from "#src/models/inventory/Currency";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { takeInventoryEntry } from "#src/services/inventory/takeInventoryEntry";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";
import { ascendWeapon } from "#src/services/weapon/ascendWeapon";
import { enhanceWeapon } from "#src/services/weapon/enhanceWeapon";
import { getBagWeapon } from "#src/services/weapon/getBagWeapon";
import { getRarityRequiredExps } from "#src/services/weapon/getRarityRequiredExps";
import { getWeaponData } from "#src/services/weapon/getWeaponData";
import { getWeaponMaxLevel } from "#src/services/weapon/getWeaponMaxLevel";
import { refineWeapon } from "#src/services/weapon/refineWeapon";
import { setBagWeapon } from "#src/services/weapon/setBagWeapon";
import { WeaponTypeNameGameTextKeyMap } from "#src/services/weapon/WeaponTypeNameGameTextKeyMap";
import { getResult } from "@esposter/shared";
import { GameScreen, WeaponMenu, WeaponMenuTab } from "genshin-interface";
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
// The level the next phase caps at, which the Ascend header writes beside the level the weapon holds
const nextMaxLevel = computed(
  () => weaponData.value.ascensionPhases[weapon.value.ascension + 1]?.maxLevel ?? maxLevel.value,
);
const { menuTabs, openTab, tabLabels } = useWeaponTabs(
  tab,
  weapon,
  () => weaponDataMap,
  () => gameText,
);
const name = computed(() => nameText[weaponData.value.nameTextId] || "");
// The weapon's kind in the reader's language, the word its header puts before the slash
const kind = computed(() => gameText[WeaponTypeNameGameTextKeyMap[weaponData.value.weaponType]]);
const { baseAttackText, nextBaseAttackText, secondaryLabel, secondaryText } = useWeaponStats(
  weapon,
  weaponData,
  () => weaponGrowCurveMap,
  () => gameText,
);
// The EXP the weapon's level takes to rise past, which the Enhance header sets beside the EXP the weapon holds
const requiredExps = computed(() => getRarityRequiredExps(rarityRequiredExpsMap, weaponData.value.rarity));
const requiredExp = computed(() => requiredExps.value[weapon.value.level - 1] ?? 0);
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
  (weaponData.value.ascensionPhases[weapon.value.ascension + 1]?.costItems ?? []).map(({ count, id }) => {
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
// Writes an accepted action's bag and wallet back and clears the picks it spent
const applyActionState = ({ inventory: nextInventory, wallet: nextWallet }: ActionState) => {
  inventory.value = nextInventory;
  wallet.value = nextWallet;
  clearPicks();
};
// A refusal is the rule's answer and changes nothing, so it is logged and the weapon and the bag stay as they were
const reportRefusal = (error: Error) => console.error(error);
// Levels the weapon with the picked ores and fodder weapons, which leave the bag, and returns the EXP past the cap as the
// Ores it fills
const enhanceAction = () =>
  getResult(() => {
    const fodders = pickedFodderIds.value.map((id) => {
      const fodder = getBagWeapon(inventory.value.items, id);
      return { data: getWeaponData(weaponDataMap, fodder.id), weapon: fodder };
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
  });
// Ascends the weapon from its phase's cap, its Mora and items spent once the Adventure Rank allows it
const ascendAction = () =>
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
      inventory: { ...inventory.value, items: setBagWeapon(items, entryId, refined.weapon) },
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
  if (openTab.value === WeaponMenuTab.Ascend)
    return weaponData.value.ascensionPhases[weapon.value.ascension + 1]?.coinCost ?? 0;
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
</script>

<template>
  <!-- The weapon screen, a dialog over the world, on the game's 1920 by 864 reference: the open tab's header (its level and EXP, its
       ascension phases, or its refinement rank), its panel (the ores and fodder weapons, the ascension materials or the refinement
       slots), the Required line's Mora and the tab's action beneath. The weapon's rarity and refinement rank are read aloud beside
       the picture -->
  <GameScreen class="weapon-screen" role="dialog" aria-modal="true" :aria-label="name">
    <WeaponMenu
      v-model:tab="openTab"
      :action-label="tabLabels[openTab]"
      :close-label="gameText[GameTextKey.Back]"
      :details-label="gameText[GameTextKey.CharacterDetails]"
      :is-action-disabled
      :kind
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
      <WeaponScreenEnhance
        v-if="openTab === WeaponMenuTab.Enhance"
        :base-attack-text="baseAttackText"
        :game-text="gameText"
        :max-level="maxLevel"
        :picked-material-count="pickedMaterialCount"
        :required-exp="requiredExp"
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
        :next-max-level="nextMaxLevel"
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
