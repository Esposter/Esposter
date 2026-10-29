<script setup lang="ts">
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { RarityRequiredExpsMap } from "#src/models/weapon/RarityRequiredExpsMap";
import type { Weapon } from "#src/models/weapon/Weapon";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { GameText } from "genshin-text";

import { Currency } from "#src/models/inventory/Currency";
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
import { WeaponTypeNameGameTextKeyMap } from "#src/services/weapon/WeaponTypeNameGameTextKeyMap";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import {
  ASCENSION_PHASE_COUNT,
  GameScreen,
  ItemCategory,
  OrnamentDivider,
  WeaponMenu,
  WeaponMenuTab,
} from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

// The bag and the wallet an accepted action leaves behind
interface ActionState {
  inventory: Inventory;
  wallet: Wallet;
}

// The phases an ascension's sparks count from the first, each one lit once the weapon holds it
const SPARK_PHASES = Array.from({ length: ASCENSION_PHASE_COUNT }, (_, index) => index + 1);
// The slots the Enhance strip shows across its width, each an ore or fodder weapon or an empty slot waiting for one
const ENHANCE_SLOT_COUNT = 7;
// The materials the Enhance panel's consumed line counts its picks against, the total the game's panel shows
const ENHANCE_MATERIAL_LIMIT = 40;
// The share of the shared divider's silver the game's hairline reads at over the weapon's scene
const DIVIDER_OPACITY = 0.16;

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
// The tabs a weapon offers: Ascend at its phase's cap and Enhance below it, and Refine where its rank can still rise
const getOfferedTabs = (target: Weapon): WeaponMenuTab[] => {
  const { canAscend, canRefine } = getWeaponActions(target, getWeaponData(target.id));
  return [canAscend ? WeaponMenuTab.Ascend : WeaponMenuTab.Enhance, ...(canRefine ? [WeaponMenuTab.Refine] : [])];
};
const offeredTabs = computed(() => getOfferedTabs(weapon.value));
// The tab the body draws: the one asked for while the weapon still offers it, else the first it offers, so a weapon that
// Levels to its cap leaves Enhance for Ascend without the parent changing the tab
const openTab = computed({
  get: () => (offeredTabs.value.includes(tab.value) ? tab.value : (offeredTabs.value[0] ?? WeaponMenuTab.Enhance)),
  set: (value: WeaponMenuTab) => {
    tab.value = value;
  },
});
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
const getLevelText = (level: number, maxLevel: number) =>
  fillGameTextValues(gameText[GameTextKey.LevelFormat], `${level}/${maxLevel}`);
const getRankText = (refinement: number) => fillGameTextValues(gameText[GameTextKey.WeaponRefinementRank], refinement);
const maxLevel = computed(() => getMaxLevel(weapon.value));
const nextMaxLevel = computed(
  () => weaponData.value.ascensionPhases[weapon.value.ascension + 1]?.maxLevel ?? maxLevel.value,
);
const isAtCap = computed(() => weapon.value.level >= maxLevel.value);
const levelText = computed(() => getLevelText(weapon.value.level, maxLevel.value));
const nextLevelText = computed(() => getLevelText(weapon.value.level, nextMaxLevel.value));
// The EXP the weapon holds towards the next level over what that level takes; a weapon at its cap has no next level
const requiredExps = computed(() => getRarityRequiredExps(rarityRequiredExpsMap, weaponData.value.rarity));
const requiredExp = computed(() => requiredExps.value[weapon.value.level - 1] ?? 0);
const experienceText = computed(() => (isAtCap.value ? "" : `${weapon.value.experience}/${requiredExp.value}`));
const name = computed(() => nameText[weaponData.value.nameTextId] || "");
// The weapon's kind in the reader's language, the word its header puts before the slash
const kind = computed(() => gameText[WeaponTypeNameGameTextKeyMap[weaponData.value.weaponType]]);
const rankText = computed(() => getRankText(weapon.value.refinement));
// The passive's name, and the two rows the game's panel lists: the held rank, then the one above it, named by its rank
const passive = computed(() => getWeaponPassive(weaponData.value, weapon.value.refinement, nameText));
const passiveRows = computed(() =>
  (passive.value?.rows ?? [])
    .slice(weapon.value.refinement - 1, weapon.value.refinement + 1)
    .map((row, index) => ({ ...row, rankText: getRankText(weapon.value.refinement + index) })),
);
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
// The level text a bag weapon's entry shows in its slot, at its own phase's cap
const getEntryLevelText = (id: number) => {
  const entry = getBagWeapon(inventory.value.items, id);
  return getLevelText(entry.level, getMaxLevel(entry));
};
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
// The Refine tab's slots, one for each rank a weapon can still gain, each holding a picked candidate or left empty
const refineSlotCount = computed(() => weaponData.value.refinementCosts.length);
const emptyRefineSlotCount = computed(() =>
  Math.max(
    0,
    refineSlotCount.value -
      copyCells.value.length -
      (refinementMaterial.value && refinementMaterial.value.count > 0 ? 1 : 0),
  ),
);
// The Enhance strip's slots, the candidates first and empty slots after them up to the seven the strip shows across its width
const emptyEnhanceSlotCount = computed(() =>
  Math.max(0, ENHANCE_SLOT_COUNT - oreCells.value.length - fodderCells.value.length),
);
const actionLabel = computed(() => tabLabels.value[openTab.value]);
// The materials the Enhance tab holds picked, the ores' counts and the fodder weapons, which its consumed line counts
const pickedMaterialCount = computed(
  () => pickedOres.value.reduce((count, ore) => count + ore.count, 0) + pickedFodderIds.value.length,
);
const consumedText = computed(() =>
  fillGameTextValues(
    gameText[GameTextKey.WeaponEnhanceMaterialsConsumed],
    pickedMaterialCount.value,
    ENHANCE_MATERIAL_LIMIT,
  ),
);
const isActionDisabled = computed(() => {
  if (openTab.value === WeaponMenuTab.Enhance)
    return pickedOres.value.length === 0 && pickedFodderIds.value.length === 0;
  // A refinement takes the copy picked or else the material, so a weapon with neither has nothing to refine with
  if (openTab.value === WeaponMenuTab.Refine)
    return pickedCopyId.value === undefined && (!refinementMaterial.value || refinementMaterial.value.count === 0);
  return false;
});
// Writes an accepted action's bag and wallet back and clears the picks it spent
const applyActionState = ({ inventory: nextInventory, wallet: nextWallet }: ActionState) => {
  inventory.value = nextInventory;
  wallet.value = nextWallet;
  pickedOres.value = [];
  pickedFodderIds.value = [];
  pickedCopyId.value = undefined;
};
// A refusal is the rule's answer and changes nothing, so it is logged and the weapon and the bag stay as they were
const reportRefusal = (error: Error) => console.error(error);
// Levels the weapon with the picked ores and fodder weapons, which leave the bag, and returns the EXP past the cap as the
// Ores it fills
const enhanceAction = () =>
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
</script>

<template>
  <!-- The weapon screen, a dialog over the world, on the game's 1920 by 864 reference: the open tab's header (its level and EXP, its
       ascension phases, or its refinement rank), its panel (the ores and fodder weapons, the ascension materials or the refinement
       slots), the Required line's Mora and the tab's action beneath. The weapon's rarity and refinement rank are read aloud beside
       the picture -->
  <GameScreen role="dialog" aria-modal="true" :aria-label="name">
    <WeaponMenu
      v-model:tab="openTab"
      :action-label="actionLabel"
      :close-label="gameText[GameTextKey.Back]"
      :details-label="gameText[GameTextKey.CharacterDetails]"
      :is-action-disabled="isActionDisabled"
      :kind
      :name
      :tabs="menuTabs"
      @action="act()"
      @close="emit('close')"
    >
      <span class="sr-only" role="img" :aria-label="`${weaponData.rarity}`" />
      <p class="refinement" :class="{ 'sr-only': openTab !== WeaponMenuTab.Refine }">{{ rankText }}</p>
      <span v-if="openTab !== WeaponMenuTab.Refine" class="talent" aria-hidden="true">{{
        gameText[GameTextKey.CharacterTalentEffect]
      }}</span>
      <p class="mora">{{ wallet[Currency.Mora] }}</p>
      <div class="divider bottom-divider"><OrnamentDivider :opacity="DIVIDER_OPACITY" /></div>
      <p class="required-label">{{ gameText[GameTextKey.CraftingRequired] }}</p>
      <p class="required-amount">{{ pendingMora }}</p>
      <template v-if="openTab === WeaponMenuTab.Enhance">
        <p class="level">{{ levelText }}</p>
        <p class="experience-text">{{ experienceText }}</p>
        <p class="consumed">{{ consumedText }}</p>
        <p class="stat base-attack">{{ gameText[GameTextKey.AttributeBaseAttack] }}</p>
        <p class="stat attack">{{ gameText[GameTextKey.AttributeAttack] }}</p>
        <div class="divider enhance-divider"><OrnamentDivider :opacity="DIVIDER_OPACITY" /></div>
        <span class="pill auto-add" aria-hidden="true">{{ gameText[GameTextKey.ArtifactAutoAdd] }}</span>
        <span class="pill filter" aria-hidden="true"
          >{{ gameText[GameTextKey.WeaponMaterialsThreeStarAndUnder] }}<span class="caret"
        /></span>
        <span class="sparkle-button" aria-hidden="true" />
        <div class="cells enhance-cells">
          <div v-for="ore of oreCells" :key="ore.id" class="cell">
            <button class="pick" :disabled="ore.pickedCount >= ore.ownedCount" type="button" @click="pickOre(ore.id)">
              <span class="cell-name">{{ ore.name }}</span>
              <span class="plus" aria-hidden="true" />
              <span class="caption" aria-hidden="true">{{ ore.pickedCount || "--" }}</span>
            </button>
            <button v-if="ore.pickedCount > 0" class="unpick" type="button" @click="unpickOre(ore.id)">−</button>
          </div>
          <div v-for="fodder of fodderCells" :key="fodder.id" class="cell">
            <button class="pick" :aria-pressed="fodder.picked" type="button" @click="toggleFodder(fodder.id)">
              <span class="cell-name">{{ fodder.name }}</span>
              <span class="plus" aria-hidden="true" />
              <span class="caption" aria-hidden="true">{{ fodder.levelText }}</span>
            </button>
          </div>
          <div v-for="slot in emptyEnhanceSlotCount" :key="slot" class="cell">
            <span class="plus" aria-hidden="true" />
            <span class="caption" aria-hidden="true">--</span>
          </div>
        </div>
      </template>
      <template v-else-if="openTab === WeaponMenuTab.Ascend">
        <div class="sparks left-sparks">
          <span v-for="phase in SPARK_PHASES" :key="phase" class="spark" :class="{ lit: phase <= weapon.ascension }" />
        </div>
        <div class="sparks right-sparks">
          <span
            v-for="phase in SPARK_PHASES"
            :key="phase"
            class="spark"
            :class="{ lit: phase <= weapon.ascension + 1 }"
          />
        </div>
        <p class="level-current">{{ levelText }}</p>
        <p class="level-next">{{ nextLevelText }}</p>
        <p class="stat ascend-base-attack">{{ gameText[GameTextKey.AttributeBaseAttack] }}</p>
        <p class="stat ascend-attack">{{ gameText[GameTextKey.AttributeAttack] }}</p>
        <OrnamentDivider class="divider ascend-divider" :opacity="DIVIDER_OPACITY" />
        <p class="materials-title">{{ gameText[GameTextKey.CombineTypeWeaponAscension] }}</p>
        <div class="cards">
          <div v-for="cost of nextPhaseCosts" :key="cost.id" class="card" :data-rarity="cost.rarity">
            <span class="card-name">{{ cost.name }}</span>
            <span class="card-count">{{ cost.ownedCount }} / {{ cost.count }}</span>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="divider refine-divider"><OrnamentDivider :opacity="DIVIDER_OPACITY" /></div>
        <p class="refinement-level">{{ gameText[GameTextKey.WeaponRefinementLevel] }}</p>
        <p class="passive-name">{{ passive?.name }}</p>
        <div class="passive">
          <p v-for="row of passiveRows" :key="row.rankText" class="passive-row">
            <span v-if="!row.isHeld" class="rank-label">{{ row.rankText }}:</span>
            {{ row.description }}
          </p>
        </div>
        <p class="refine-material">{{ gameText[GameTextKey.WeaponRefinementMaterial] }}</p>
        <span class="pill auto-add refine-auto-add" aria-hidden="true">{{
          gameText[GameTextKey.ArtifactAutoAdd]
        }}</span>
        <div class="cells refine-cells">
          <div v-if="refinementMaterial && refinementMaterial.count > 0" class="cell">
            <button class="pick" :aria-pressed="pickedCopyId === undefined" type="button" @click="pickMaterial()">
              <span class="cell-name">{{ refinementMaterial.name }}</span>
              <span class="plus" aria-hidden="true" />
              <span class="caption" aria-hidden="true">{{ refinementMaterial.count }}</span>
            </button>
          </div>
          <div v-for="copy of copyCells" :key="copy.id" class="cell">
            <button class="pick" :aria-pressed="pickedCopyId === copy.id" type="button" @click="pickCopy(copy.id)">
              <span class="cell-name">{{ copy.name }}</span>
              <span class="plus" aria-hidden="true" />
              <span class="caption" aria-hidden="true">{{ copy.levelText }}</span>
            </button>
          </div>
          <div v-for="slot in emptyRefineSlotCount" :key="slot" class="cell">
            <span class="plus" aria-hidden="true" />
          </div>
        </div>
      </template>
    </WeaponMenu>
  </GameScreen>
</template>

<style scoped>
/* Every measure is a pixel of the reference's 1920 by 864 still, through the frame's `--reference-pixel` */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.talent {
  position: absolute;
  top: calc(var(--reference-pixel) * 27);
  left: calc(var(--reference-pixel) * 1281);
  width: calc(var(--reference-pixel) * 236);
  height: calc(var(--reference-pixel) * 40);
  text-indent: calc(var(--reference-pixel) * 51);
  border-radius: calc(var(--reference-pixel) * 20);
  background: #f5d48a;
  color: #3d3d48;
  font-size: calc(var(--reference-pixel) * 25);
  font-weight: 600;
  line-height: calc(var(--reference-pixel) * 44);
  letter-spacing: calc(var(--reference-pixel) * 2.2);
  white-space: nowrap;
}

.mora {
  position: absolute;
  top: calc(var(--reference-pixel) * 27);
  left: calc(var(--reference-pixel) * 1541);
  width: calc(var(--reference-pixel) * 161);
  height: calc(var(--reference-pixel) * 40);
  margin: 0;
  padding-left: calc(var(--reference-pixel) * 57);
  border-radius: calc(var(--reference-pixel) * 20);
  background: rgb(20 16 50 / 0.45);
  color: #e7e9f6;
  font-size: calc(var(--reference-pixel) * 25);
  font-weight: 600;
  line-height: calc(var(--reference-pixel) * 40);
}

.divider {
  position: absolute;
  left: calc(var(--reference-pixel) * 1086);
  width: calc(var(--reference-pixel) * 738);
}

.bottom-divider {
  top: calc(var(--reference-pixel) * 730);
}

.enhance-divider {
  top: calc(var(--reference-pixel) * 180);
}

.ascend-divider {
  top: calc(var(--reference-pixel) * 190);
}

.refine-divider {
  top: calc(var(--reference-pixel) * 173);
}

.required-label,
.required-amount {
  position: absolute;
  margin: 0;
  font-weight: 600;
  line-height: 1;
}

.required-label {
  top: calc(var(--reference-pixel) * 791);
  left: calc(var(--reference-pixel) * 1107);
  color: #d6cabe;
  font-size: calc(var(--reference-pixel) * 28);
}

.required-amount {
  top: calc(var(--reference-pixel) * 789);
  left: calc(var(--reference-pixel) * 1275);
  color: #eee8f5;
  font-size: calc(var(--reference-pixel) * 24);
}

/* Enhance's header: the level in white with its EXP at the right in lilac, and the two stats' names */
.level {
  position: absolute;
  top: calc(var(--reference-pixel) * 110);
  left: calc(var(--reference-pixel) * 1104);
  margin: 0;
  color: #f5effb;
  font-size: calc(var(--reference-pixel) * 43);
  font-weight: 600;
  line-height: 1;
}

.experience-text {
  position: absolute;
  top: calc(var(--reference-pixel) * 124);
  right: calc(var(--reference-pixel) * 122);
  margin: 0;
  color: #c9a2ee;
  font-size: calc(var(--reference-pixel) * 24);
  font-weight: 600;
  line-height: 1;
}

.stat {
  position: absolute;
  margin: 0;
  color: #efe9f9;
  font-weight: 600;
  line-height: 1;
}

.base-attack {
  top: calc(var(--reference-pixel) * 218);
  left: calc(var(--reference-pixel) * 1130);
  font-size: calc(var(--reference-pixel) * 33);
}

.attack {
  top: calc(var(--reference-pixel) * 292);
  left: calc(var(--reference-pixel) * 1128);
  font-size: calc(var(--reference-pixel) * 29);
}

/* Ascend's stat names sit lower, under its level pair, at the sizes their words set */
.ascend-base-attack {
  top: calc(var(--reference-pixel) * 231);
  left: calc(var(--reference-pixel) * 1130);
  font-size: calc(var(--reference-pixel) * 33);
}

.ascend-attack {
  top: calc(var(--reference-pixel) * 305);
  left: calc(var(--reference-pixel) * 1128);
  font-size: calc(var(--reference-pixel) * 28);
}

/* Enhance's panel: a strip of slots, each a grey card over the cream band its count sits on, the ores first */
.cells {
  position: absolute;
  display: flex;
  overflow: hidden;
}

.enhance-cells {
  top: calc(var(--reference-pixel) * 600);
  left: calc(var(--reference-pixel) * 1104);
  width: calc(var(--reference-pixel) * 714);
  height: calc(var(--reference-pixel) * 122);
  gap: calc(var(--reference-pixel) * 13);
}

.refine-cells {
  top: calc(var(--reference-pixel) * 604);
  left: calc(var(--reference-pixel) * 1222);
  gap: calc(var(--reference-pixel) * 18);
}

.cell {
  position: relative;
  flex: none;
  width: calc(var(--reference-pixel) * 98.5);
  height: calc(var(--reference-pixel) * 122);
}

.refine-cells .cell {
  width: calc(var(--reference-pixel) * 101);
}

.pick {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: none;
  border-radius: calc(var(--reference-pixel) * 12);
  background: linear-gradient(#6f6f7b 0 80%, #ece6e0 80% 100%);
  color: inherit;
  cursor: inherit;
  font: inherit;
}

.pick:disabled {
  opacity: 0.6;
}

.pick[aria-pressed="true"] {
  background: linear-gradient(#7c7c8a 0 80%, #f6f2ee 80% 100%);
}

/* The slot's plus, centred on the card's grey above its cream band */
.plus {
  position: absolute;
  top: calc(var(--reference-pixel) * 29);
  left: calc(50% - var(--reference-pixel) * 20);
  width: calc(var(--reference-pixel) * 40);
  height: calc(var(--reference-pixel) * 40);
}

.plus::before,
.plus::after {
  position: absolute;
  top: 50%;
  left: 50%;
  background: #d8d6de;
  content: "";
  translate: -50% -50%;
}

.plus::before {
  width: calc(var(--reference-pixel) * 40);
  height: calc(var(--reference-pixel) * 7);
}

.plus::after {
  width: calc(var(--reference-pixel) * 7);
  height: calc(var(--reference-pixel) * 40);
}

.caption {
  position: absolute;
  top: calc(var(--reference-pixel) * 101);
  right: 0;
  left: 0;
  color: #55555e;
  font-size: calc(var(--reference-pixel) * 16);
  font-weight: 600;
  line-height: 1;
  text-align: center;
}

/* A slot's name is read aloud over the whole slot, its art not drawn; it is clear so only its slot is the thing clicked */
.cell-name {
  position: absolute;
  inset: 0;
  color: transparent;
  font-size: 1px;
}

.unpick {
  position: absolute;
  top: calc(var(--reference-pixel) * 4);
  right: calc(var(--reference-pixel) * 4);
  width: calc(var(--reference-pixel) * 18);
  height: calc(var(--reference-pixel) * 18);
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgb(0 0 0 / 0.5);
  color: #fff;
  font: inherit;
  font-size: calc(var(--reference-pixel) * 14);
  line-height: 1;
}

/* The game's cream pills that show the ores' filter and the Auto Add button, drawn as the game draws them */
.pill {
  position: absolute;
  height: calc(var(--reference-pixel) * 50);
  border-radius: calc(var(--reference-pixel) * 25);
  background: #ece5d6;
  color: #3d3d48;
  font-size: calc(var(--reference-pixel) * 27);
  font-weight: 600;
  line-height: calc(var(--reference-pixel) * 50);
  text-align: center;
}

.auto-add {
  top: calc(var(--reference-pixel) * 527);
  left: calc(var(--reference-pixel) * 1584);
  width: calc(var(--reference-pixel) * 216);
  line-height: calc(var(--reference-pixel) * 44);
}

.refine-auto-add {
  top: calc(var(--reference-pixel) * 539);
}

.filter {
  top: calc(var(--reference-pixel) * 527);
  left: calc(var(--reference-pixel) * 1103);
  width: calc(var(--reference-pixel) * 458);
  text-indent: calc(var(--reference-pixel) * 22);
  font-size: calc(var(--reference-pixel) * 25);
  letter-spacing: calc(var(--reference-pixel) * 1.8);
  text-align: left;
}

/* The round cream button beside Enhance, its glyph left undrawn */
.sparkle-button {
  position: absolute;
  top: calc(var(--reference-pixel) * 772);
  left: calc(var(--reference-pixel) * 1424);
  width: calc(var(--reference-pixel) * 64);
  height: calc(var(--reference-pixel) * 64);
  border-radius: 50%;
  background: #ece4da;
}

.caret {
  position: absolute;
  top: calc(var(--reference-pixel) * 21);
  left: calc(var(--reference-pixel) * 424);
  border-top: calc(var(--reference-pixel) * 9) solid #3b4354;
  border-right: calc(var(--reference-pixel) * 7) solid transparent;
  border-left: calc(var(--reference-pixel) * 7) solid transparent;
}

/* Ascend's header: the phases as sparks, each row of six, the left lit to the weapon's phase and the right to the next */
.sparks {
  position: absolute;
  top: calc(var(--reference-pixel) * 106);
  display: flex;
}

.left-sparks {
  left: calc(var(--reference-pixel) * 1191);
  gap: calc(var(--reference-pixel) * 13);
}

.right-sparks {
  left: calc(var(--reference-pixel) * 1499);
  gap: calc(var(--reference-pixel) * 12.6);
}

.spark {
  width: calc(var(--reference-pixel) * 31);
  height: calc(var(--reference-pixel) * 31);
  background: #9b99ad;
  clip-path: polygon(50% 0, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0 50%, 40% 40%);
}

.spark.lit {
  background: #fff;
}

.level-current,
.level-next {
  position: absolute;
  top: calc(var(--reference-pixel) * 158);
  margin: 0;
  font-size: calc(var(--reference-pixel) * 31);
  font-weight: 600;
  line-height: 1;
}

.level-current {
  left: calc(var(--reference-pixel) * 1237);
  color: #e6e1f2;
}

.level-next {
  left: calc(var(--reference-pixel) * 1546);
  color: #f2e3b5;
}

.materials-title {
  position: absolute;
  top: calc(var(--reference-pixel) * 548);
  left: calc(var(--reference-pixel) * 1276);
  margin: 0;
  color: #e9d29a;
  font-size: calc(var(--reference-pixel) * 28);
  font-weight: 600;
  line-height: 1;
}

/* Ascend's materials: a card per ingredient, its art over a rarity's tint and its count on a cream band */
.cards {
  position: absolute;
  top: calc(var(--reference-pixel) * 597);
  left: calc(var(--reference-pixel) * 1282);
  display: flex;
  gap: calc(var(--reference-pixel) * 19.25);
}

.card {
  position: relative;
  width: calc(var(--reference-pixel) * 100);
  height: calc(var(--reference-pixel) * 121);
  overflow: hidden;
  border-radius: calc(var(--reference-pixel) * 6);
  background: linear-gradient(#52706f, #467f71 80%, #ede6e3 80%);
}

.card[data-rarity="1"] {
  background: linear-gradient(#5f6069, #6e6c75 80%, #ede6e3 80%);
}

.card-name {
  position: absolute;
  color: transparent;
  font-size: 1px;
}

.card-count {
  position: absolute;
  top: calc(var(--reference-pixel) * 98);
  right: 0;
  left: 0;
  height: calc(var(--reference-pixel) * 23);
  color: #3d3c44;
  font-size: calc(var(--reference-pixel) * 17);
  font-weight: 600;
  line-height: calc(var(--reference-pixel) * 23);
  text-align: center;
}

/* Refine's header: the rank the weapon holds, centred over its panel; the ornaments either side of it are not drawn */
.refinement {
  top: calc(var(--reference-pixel) * 98);
  color: #f6f0f9;
  font-size: calc(var(--reference-pixel) * 42);
}

/* The words the game sets over the panels: the Enhance panel's consumed count, the Refine header's rank, the Refine tab's level and the passive's name */
.consumed,
.refinement,
.refinement-level,
.passive-name {
  position: absolute;
  left: calc(var(--reference-pixel) * 1097);
  width: calc(var(--reference-pixel) * 706);
  margin: 0;
  font-weight: 600;
  line-height: 1;
  text-align: center;
}

.consumed {
  top: calc(var(--reference-pixel) * 489);
  color: #e9d29a;
  font-size: calc(var(--reference-pixel) * 25);
  letter-spacing: calc(var(--reference-pixel) * 1.9);
}

.refinement-level {
  top: calc(var(--reference-pixel) * 149);
  color: #e9d29a;
  font-size: calc(var(--reference-pixel) * 22);
  letter-spacing: calc(var(--reference-pixel) * 1.3);
}

.passive-name {
  top: calc(var(--reference-pixel) * 208);
  color: #f5f0fb;
  font-size: calc(var(--reference-pixel) * 29);
  letter-spacing: calc(var(--reference-pixel) * 2.2);
}

.refine-material {
  position: absolute;
  top: calc(var(--reference-pixel) * 552);
  left: calc(var(--reference-pixel) * 1104);
  margin: 0;
  color: #e9d29a;
  font-size: calc(var(--reference-pixel) * 26);
  font-weight: 600;
  line-height: 1;
  letter-spacing: calc(var(--reference-pixel) * 1.2);
}

/* The held rank and the next rank's description, wrapped to the panel, the next rank's label in its own colour */
.passive {
  position: absolute;
  top: calc(var(--reference-pixel) * 252);
  left: calc(var(--reference-pixel) * 1104);
  width: calc(var(--reference-pixel) * 696);
  color: #efe9f9;
  font-size: calc(var(--reference-pixel) * 24);
  font-weight: 600;
  line-height: calc(var(--reference-pixel) * 29);
  letter-spacing: calc(var(--reference-pixel) * 1.1);
}

.passive-row {
  margin: 0 0 calc(var(--reference-pixel) * 16);
  text-indent: calc(var(--reference-pixel) * 24);
}

.rank-label {
  color: #6ad4ee;
}
</style>
