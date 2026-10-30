<script setup lang="ts">
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { RarityRequiredExpsMap } from "#src/models/weapon/RarityRequiredExpsMap";
import type { Weapon } from "#src/models/weapon/Weapon";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { GameText } from "genshin-text";

import { Attribute } from "#src/models/character/Attribute";
import { Currency } from "#src/models/inventory/Currency";
import { formatAttributeValue } from "#src/services/character/formatAttributeValue";
import { formatWholeNumber } from "#src/services/character/formatWholeNumber";
import { getAttributeLabel } from "#src/services/character/getAttributeLabel";
import { getSecondaryAttribute } from "#src/services/character/getSecondaryAttribute";
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
import { getWeaponAttributeTotals } from "#src/services/weapon/getWeaponAttributeTotals";
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
import { fillGameTextValues, GameTextKey, splitGameTextColors } from "genshin-text";

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
// The dot the game's Current line opens on, which each passive row draws as its bullet instead
const CURRENT_DOT_PATTERN = /^·/u;

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
// The level Enhance's header shows alone; the Ascend header writes its own level pair over the cap of each phase
const levelText = computed(() => fillGameTextValues(gameText[GameTextKey.LevelFormat], `${weapon.value.level}`));
const getAttributeTotals = (ascension: number) =>
  getWeaponAttributeTotals(weaponData.value, weaponGrowCurveMap, weapon.value.level, ascension);
// The base ATK at the held phase and at the next one, which the Ascend row sets side by side
const getBaseAttackText = (ascension: number) => formatWholeNumber(getAttributeTotals(ascension)[Attribute.BaseAttack]);
const baseAttackText = computed(() => getBaseAttackText(weapon.value.ascension));
const nextBaseAttackText = computed(() => getBaseAttackText(weapon.value.ascension + 1));
// The secondary attribute the weapon grows beside its base ATK, at the held phase, written whole or as a percentage by its
// Kind; a secondary the label map names no caption for leaves its caption undrawn
const secondaryAttribute = computed(() => getSecondaryAttribute(weaponData.value));
const secondaryText = computed(() =>
  secondaryAttribute.value === undefined
    ? ""
    : formatAttributeValue(
        secondaryAttribute.value,
        getAttributeTotals(weapon.value.ascension)[secondaryAttribute.value],
      ),
);
const secondaryLabel = computed(() =>
  secondaryAttribute.value === undefined ? "" : getAttributeLabel(secondaryAttribute.value, gameText),
);
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
// The held rank's row is the game's Current line, its label coloured in the text, and the next rank's row is labelled by its rank.
// Each row's dot is drawn as a bullet, so the Current line's own dot is left out of its first run
const passiveRows = computed(() =>
  (passive.value?.rows ?? [])
    .slice(weapon.value.refinement - 1, weapon.value.refinement + 1)
    .map((row, index) => ({
      currentSegments: row.isHeld
        ? splitGameTextColors(fillGameTextValues(gameText[GameTextKey.WeaponRefinementCurrent], row.description)).map(
            (segment, segmentIndex) => ({
              ...segment,
              text: segmentIndex === 0 ? segment.text.replace(CURRENT_DOT_PATTERN, "") : segment.text,
            }),
          )
        : [],
      description: row.description,
      isHeld: row.isHeld,
      rankText: getRankText(weapon.value.refinement + index),
    })),
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
// Whether the bag holds the refinement material at all, which a refinement can take in place of a copy
const isRefinementMaterialHeld = computed(() => (refinementMaterial.value?.count ?? 0) > 0);
// The Refine tab's slots, one for each rank a weapon can still gain, each holding a picked candidate or left empty
const refineSlotCount = computed(() => weaponData.value.refinementCosts.length);
// The slots left empty after the open tab's candidates: the Enhance strip's seven, the seventh cut off at its right edge
// As the game's strip cuts it, and the Refine tab's rank slots that no candidate has taken
const emptySlotCount = computed(() =>
  openTab.value === WeaponMenuTab.Enhance
    ? Math.max(0, ENHANCE_SLOT_COUNT - oreCells.value.length - fodderCells.value.length)
    : Math.max(0, refineSlotCount.value - copyCells.value.length - (isRefinementMaterialHeld.value ? 1 : 0)),
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
    return pickedCopyId.value === undefined && !isRefinementMaterialHeld.value;
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
  <GameScreen class="weapon-screen" role="dialog" aria-modal="true" :aria-label="name">
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
      <p class="refinement" :class="{ 'sr-only': openTab !== WeaponMenuTab.Refine }">
        <span class="ornament left" aria-hidden="true" />{{ rankText
        }}<span class="ornament right" aria-hidden="true" />
      </p>
      <span v-if="openTab !== WeaponMenuTab.Refine" class="talent" aria-hidden="true">{{
        gameText[GameTextKey.CharacterTalentEffect]
      }}</span>
      <p class="mora">{{ wallet[Currency.Mora] }}</p>
      <div class="divider bottom-divider"><OrnamentDivider is-middle-hidden :opacity="DIVIDER_OPACITY" /></div>
      <p class="required-label">{{ gameText[GameTextKey.CraftingRequired] }}</p>
      <p class="required-amount">{{ pendingMora }}</p>
      <template v-if="openTab === WeaponMenuTab.Enhance">
        <p class="level">{{ levelText }}</p>
        <p class="experience-text">{{ experienceText }}</p>
        <span class="exp-track" aria-hidden="true" />
        <p class="consumed">{{ consumedText }}</p>
        <p class="stat base-attack">{{ gameText[GameTextKey.AttributeBaseAttack] }}</p>
        <p class="stat-value base-attack-value">{{ baseAttackText }}</p>
        <p class="stat attack">{{ secondaryLabel }}</p>
        <p class="stat-value attack-value">{{ secondaryText }}</p>
        <div class="divider enhance-divider"><OrnamentDivider is-middle-hidden :opacity="DIVIDER_OPACITY" /></div>
        <span class="stats-rule enhance-stats-rule" aria-hidden="true" />
        <span class="pill auto-add" aria-hidden="true">{{ gameText[GameTextKey.ArtifactAutoAdd] }}</span>
        <span class="pill filter" aria-hidden="true"
          >{{ gameText[GameTextKey.WeaponMaterialsThreeStarAndUnder] }}<span class="caret"
        /></span>
        <span class="sparkle-button" aria-hidden="true" />
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
        <p class="level-current">
          <span class="level-word">{{ gameText[GameTextKey.LevelShort] }}</span> {{ weapon.level }} / {{ maxLevel }}
        </p>
        <span class="arrow level-arrow" aria-hidden="true" />
        <p class="level-next">
          <span class="level-word">{{ gameText[GameTextKey.LevelShort] }}</span> {{ weapon.level }} /
          <span class="next-max">{{ nextMaxLevel }}</span>
        </p>
        <p class="stat ascend-base-attack">{{ gameText[GameTextKey.AttributeBaseAttack] }}</p>
        <p class="stat-value base-current">{{ baseAttackText }}</p>
        <span class="arrow" aria-hidden="true" />
        <p class="stat-value base-next">{{ nextBaseAttackText }}</p>
        <p class="stat ascend-attack">{{ secondaryLabel }}</p>
        <p class="stat-value attack-current">{{ secondaryText }}</p>
        <OrnamentDivider class="divider ascend-divider" is-middle-hidden :opacity="DIVIDER_OPACITY" />
        <span class="stats-rule ascend-stats-rule" aria-hidden="true" />
        <p class="materials-title">{{ gameText[GameTextKey.CombineTypeWeaponAscension] }}</p>
        <div class="cards">
          <div v-for="cost of nextPhaseCosts" :key="cost.id" class="card" :data-rarity="cost.rarity">
            <span class="card-name">{{ cost.name }}</span>
            <span class="card-stars" aria-hidden="true"
              ><span v-for="star in cost.rarity" :key="star" class="star"
            /></span>
            <span class="card-count">{{ cost.ownedCount }} / {{ cost.count }}</span>
          </div>
        </div>
      </template>
      <template v-if="openTab === WeaponMenuTab.Refine">
        <div class="divider refine-divider"><OrnamentDivider is-middle-hidden :opacity="DIVIDER_OPACITY" /></div>
        <p class="refinement-level">{{ gameText[GameTextKey.WeaponRefinementLevel] }}</p>
        <p class="passive-name">
          <span class="bullet" aria-hidden="true" />{{ passive?.name }}<span class="bullet" aria-hidden="true" />
        </p>
        <div class="passive">
          <p v-for="row of passiveRows" :key="row.rankText" class="passive-row" :class="{ held: row.isHeld }">
            <template v-if="row.isHeld">
              <span v-for="(segment, index) of row.currentSegments" :key="index" :style="{ color: segment.color }">{{
                segment.text
              }}</span>
            </template>
            <template v-else
              ><span class="rank-label">{{ row.rankText }}:</span> {{ row.description }}</template
            >
          </p>
        </div>
        <span class="stats-rule refine-stats-rule" aria-hidden="true" />
        <p class="refine-material">{{ gameText[GameTextKey.WeaponRefinementMaterial] }}</p>
        <span class="pill auto-add refine-auto-add" aria-hidden="true">{{
          gameText[GameTextKey.ArtifactAutoAdd]
        }}</span>
      </template>
      <div
        v-if="openTab !== WeaponMenuTab.Ascend"
        class="cells"
        :class="openTab === WeaponMenuTab.Enhance ? 'enhance-cells' : 'refine-cells'"
      >
        <template v-if="openTab === WeaponMenuTab.Enhance">
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
        </template>
        <template v-else>
          <div v-if="refinementMaterial && isRefinementMaterialHeld" class="cell">
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
        </template>
        <div v-for="slot in emptySlotCount" :key="slot" class="cell">
          <span class="pick" aria-hidden="true">
            <span class="plus" />
            <span class="caption">--</span>
          </span>
        </div>
      </div>
    </WeaponMenu>
  </GameScreen>
</template>

<style scoped>
/* The still is 1920 by 864, so its frame spans 2400 units at the height's unit, the width the unit fits in a window */
.weapon-screen {
  --game-design-width: 2400;
}

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
  background: rgb(20 16 50 / 0.35);
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

/* The rule between two stat rows: a faint hairline with a small star at its middle, which the game sets instead of a divider's ends */
.stats-rule {
  position: absolute;
  left: calc(var(--reference-pixel) * 1100);
  width: calc(var(--reference-pixel) * 705);
  height: calc(var(--reference-pixel) * 1);
  background: rgb(200 196 225 / 0.22);
}

.stats-rule::before {
  position: absolute;
  top: calc(var(--reference-pixel) * -4);
  left: calc(50% - var(--reference-pixel) * 4);
  width: calc(var(--reference-pixel) * 9);
  height: calc(var(--reference-pixel) * 9);
  background: rgb(200 196 225 / 0.4);
  clip-path: var(--sparkle-clip-path);
  content: "";
}

.enhance-stats-rule {
  top: calc(var(--reference-pixel) * 272);
}

.ascend-stats-rule {
  top: calc(var(--reference-pixel) * 285);
}

.refine-stats-rule {
  top: calc(var(--reference-pixel) * 528);
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
  background: linear-gradient(#6e707c 0 80%, #f6f2ee 80% 100%);
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
  background: #bab9c0;
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
  background: #e0d6ce;
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
  background: #e5dddd;
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
  gap: calc(var(--reference-pixel) * 10);
}

.right-sparks {
  left: calc(var(--reference-pixel) * 1499);
  gap: calc(var(--reference-pixel) * 10);
}

.spark {
  width: calc(var(--reference-pixel) * 31);
  height: calc(var(--reference-pixel) * 31);
  background: #8e8c98;
  clip-path: var(--sparkle-clip-path);
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
  color: #f5f0fb;
}

.level-next {
  left: calc(var(--reference-pixel) * 1546);
  color: #f5f0fb;
}

/* The "Lv." word sits dimmer than its numbers, and the cap the next phase reaches is the game's gold */
.level-word {
  color: #bdb4cd;
}

.next-max {
  color: #f5c33b;
}

/* The arrow between the two levels, the grey shaft and head the base ATK's arrow has */
.level-arrow {
  top: calc(var(--reference-pixel) * 155);
  left: calc(var(--reference-pixel) * 1437);
  width: calc(var(--reference-pixel) * 33);
}

.materials-title {
  position: absolute;
  top: calc(var(--reference-pixel) * 548);
  left: calc(var(--reference-pixel) * 1276);
  margin: 0;
  color: #dcc58e;
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
  position: relative;
  margin: 0 0 calc(var(--reference-pixel) * 16);
  text-indent: calc(var(--reference-pixel) * 24);
}

/* Each rank's row opens on a dot, the bullet the game sets before its label */
.passive-row::before {
  position: absolute;
  top: calc(var(--reference-pixel) * 11);
  left: calc(var(--reference-pixel) * 8);
  width: calc(var(--reference-pixel) * 5);
  height: calc(var(--reference-pixel) * 5);
  border-radius: 50%;
  background: #fff;
  content: "";
}

.rank-label {
  color: #6ad4ee;
}

/* The dots either side of the passive's name, set in the line so the name keeps its centre */
.bullet {
  display: inline-block;
  width: calc(var(--reference-pixel) * 6);
  height: calc(var(--reference-pixel) * 6);
  margin: 0 calc(var(--reference-pixel) * 22);
  border-radius: 50%;
  background: #fff;
  vertical-align: middle;
}

/* The rank's two ornaments, a hairline with a sparkle at its end either side of the rank */
.ornament {
  position: absolute;
  top: 50%;
  width: calc(var(--reference-pixel) * 36);
  height: calc(var(--reference-pixel) * 1);
  background: #cfc8dc;
  translate: 0 -50%;
}

.ornament::before {
  position: absolute;
  top: calc(var(--reference-pixel) * -5);
  width: calc(var(--reference-pixel) * 10);
  height: calc(var(--reference-pixel) * 10);
  background: #e3dded;
  clip-path: var(--sparkle-clip-path);
  content: "";
}

.ornament.left {
  left: calc(var(--reference-pixel) * 235);
}

.ornament.left::before {
  right: calc(var(--reference-pixel) * -5);
}

.ornament.right {
  right: calc(var(--reference-pixel) * 236);
}

.ornament.right::before {
  left: calc(var(--reference-pixel) * -5);
}

/* The stat values the rows read at their right: Enhance's base ATK and secondary attribute, and Ascend's two base ATKs either side of its arrow */
.stat-value {
  position: absolute;
  width: calc(var(--reference-pixel) * 100);
  margin: 0;
  color: #efe9f9;
  font-weight: 600;
  line-height: 1;
  text-align: right;
}

.base-attack-value {
  top: calc(var(--reference-pixel) * 218);
  left: calc(var(--reference-pixel) * 1700);
  font-size: calc(var(--reference-pixel) * 33);
}

.attack-value {
  top: calc(var(--reference-pixel) * 292);
  left: calc(var(--reference-pixel) * 1700);
  font-size: calc(var(--reference-pixel) * 29);
}

.base-current,
.base-next {
  top: calc(var(--reference-pixel) * 231);
  font-size: calc(var(--reference-pixel) * 33);
}

.base-current {
  left: calc(var(--reference-pixel) * 1376);
}

.base-next {
  left: calc(var(--reference-pixel) * 1698);
}

.attack-current {
  top: calc(var(--reference-pixel) * 305);
  left: calc(var(--reference-pixel) * 1698);
  font-size: calc(var(--reference-pixel) * 28);
}

/* Ascend's arrow between the two base ATKs: a grey shaft with its head */
.arrow {
  position: absolute;
  top: calc(var(--reference-pixel) * 243);
  left: calc(var(--reference-pixel) * 1580);
  width: calc(var(--reference-pixel) * 26);
  height: calc(var(--reference-pixel) * 3);
  background: #6b6479;
}

.arrow::after {
  position: absolute;
  top: calc(var(--reference-pixel) * -4);
  right: 0;
  border-top: calc(var(--reference-pixel) * 5.5) solid transparent;
  border-bottom: calc(var(--reference-pixel) * 5.5) solid transparent;
  border-left: calc(var(--reference-pixel) * 9) solid #6b6479;
  content: "";
}

/* The EXP track under the level: a hairline in the game's dark red */
.exp-track {
  position: absolute;
  top: calc(var(--reference-pixel) * 165);
  left: calc(var(--reference-pixel) * 1140);
  width: calc(var(--reference-pixel) * 655);
  height: calc(var(--reference-pixel) * 2);
  background: #482864;
}

/* The marks before the stat names: a sparkle before Base ATK and a dot before the percentage */
.base-attack::before,
.ascend-base-attack::before {
  position: absolute;
  top: calc(var(--reference-pixel) * 2);
  left: calc(var(--reference-pixel) * -33);
  width: calc(var(--reference-pixel) * 23);
  height: calc(var(--reference-pixel) * 23);
  background: #d9d3ea;
  clip-path: var(--sparkle-clip-path);
  content: "";
}

.attack::before,
.ascend-attack::before {
  position: absolute;
  left: calc(var(--reference-pixel) * -24);
  width: calc(var(--reference-pixel) * 9);
  height: calc(var(--reference-pixel) * 9);
  border-radius: 50%;
  background: #aaa3bd;
  content: "";
}

.attack::before {
  top: calc(var(--reference-pixel) * 8);
}

.ascend-attack::before {
  top: calc(var(--reference-pixel) * 6);
}

/* The gold coins beside the Mora: the Required line's and the wallet's */
.required-amount::before,
.mora::before {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #fff7c8, #f7d25a 60%, #d9a53a);
  content: "";
}

.required-amount::before {
  top: calc(var(--reference-pixel) * 1);
  left: calc(var(--reference-pixel) * -45);
  width: calc(var(--reference-pixel) * 27);
  height: calc(var(--reference-pixel) * 27);
}

.mora::before {
  top: calc(var(--reference-pixel) * 5);
  left: calc(var(--reference-pixel) * 11);
  width: calc(var(--reference-pixel) * 30);
  height: calc(var(--reference-pixel) * 30);
}

/* The round cream button's sparkle: a large star and a small one at its lower right */
.sparkle-button::before,
.sparkle-button::after {
  position: absolute;
  background: #35344a;
  clip-path: var(--sparkle-clip-path);
  content: "";
}

.sparkle-button::before {
  top: calc(var(--reference-pixel) * 14);
  left: calc(var(--reference-pixel) * 16);
  width: calc(var(--reference-pixel) * 34);
  height: calc(var(--reference-pixel) * 34);
}

.sparkle-button::after {
  top: calc(var(--reference-pixel) * 28);
  left: calc(var(--reference-pixel) * 43);
  width: calc(var(--reference-pixel) * 16);
  height: calc(var(--reference-pixel) * 16);
}

/* A card's rarity: its gold stars, centred over the art above its count band */
.card-stars {
  position: absolute;
  top: calc(var(--reference-pixel) * 87);
  right: 0;
  left: 0;
  display: flex;
  justify-content: center;
  gap: calc(var(--reference-pixel) * 2);
}

.star {
  width: calc(var(--reference-pixel) * 13);
  height: calc(var(--reference-pixel) * 13);
  background: #f5c24a;
  clip-path: polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}
</style>
