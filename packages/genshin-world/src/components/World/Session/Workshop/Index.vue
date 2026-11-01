<script setup lang="ts">
import type { CookingTalent } from "#src/models/cooking/CookingTalent";
import type { AchievementEvent } from "#src/models/achievement/AchievementEvent";
import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { ProcessingJob } from "#src/models/cooking/ProcessingJob";
import type { ProcessingRecipe } from "#src/models/cooking/ProcessingRecipe";
import type { CraftingProgress } from "#src/models/crafting/CraftingProgress";
import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { WorldTables } from "#src/models/world/WorldTables";
import type { CraftingCell, ForgeTab } from "genshin-interface";
import type { GameText } from "genshin-text";

import CookingScreen from "#src/components/Cooking/Screen/Index.vue";
import ProcessingScreen from "#src/components/Cooking/Processing/Index.vue";
import CraftingScreen from "#src/components/Crafting/Screen/Index.vue";
import ForgeScreen from "#src/components/Forge/Screen/Index.vue";
import { ScreenKind } from "#src/models/screen/ScreenKind";

// The cooking stove, the processing table, the crafting bench and the forge, which the player works at with the bag open
interface Props {
  activeCharacterId: number;
  adventureRank: number;
  adventureRankTables: WorldTables["adventureRankTables"];
  completedMainQuestIds: ReadonlySet<string>;
  cookingTalents: Record<string, CookingTalent>;
  craftingArtifactDropTables: Pick<WorldTables, "artifactMainAffixPools" | "artifactRarityDataMap" | "reliquarySets">;
  craftingProgress: CraftingProgress;
  craftingRecipes: WorldTables["craftingRecipes"];
  craftingStrongboxes: WorldTables["craftingStrongboxes"];
  crafters: CraftingCell[];
  forgeDefinitions: Map<number, ItemDefinition>;
  forgeNow: Temporal.Instant;
  forgeRecipes: ForgeRecipe[];
  forgeWeapons: Map<number, Pick<ItemDefinition, "name"> & WeaponData>;
  gameText: GameText;
  getWorldNow: () => Temporal.Instant;
  initialCrafterId: number;
  inventory: Inventory;
  materialDataMap: WorldTables["materialDataMap"];
  nameText: WorldTables["nameText"];
  openCookingRecipes: CookingRecipe[];
  partyCharacterIds: number[];
  processingRecipes: ProcessingRecipe[];
  random: () => number;
  reliquaryPieceEntryMap: WorldTables["reliquaryPieceEntryMap"];
  screenKind: ScreenKind;
  wallet: Wallet;
  weaponDataMap: WorldTables["statTables"]["weaponDataMap"];
  worldNow: Temporal.Instant;
}

const adventureExp = defineModel<number>("adventureExp", { required: true });
const cookingProgress = defineModel<CookingProgress>("cookingProgress", { required: true });
const cookingRecipe = defineModel<CookingRecipe>("cookingRecipe");
const craftedCountMap = defineModel<ReadonlyMap<number, number>>("craftedCountMap", { required: true });
const forgeAmount = defineModel<number>("forgeAmount", { required: true });
const forgeProgress = defineModel<ForgeProgress>("forgeProgress", { required: true });
const forgeRecipeId = defineModel<number>("forgeRecipeId", { required: true });
const forgeTab = defineModel<ForgeTab>("forgeTab", { required: true });
const processingJobs = defineModel<Record<number, ProcessingJob>>("processingJobs", { required: true });
const {
  activeCharacterId,
  adventureRank,
  adventureRankTables,
  completedMainQuestIds,
  cookingTalents,
  craftingArtifactDropTables,
  craftingProgress,
  craftingRecipes,
  craftingStrongboxes,
  crafters,
  forgeDefinitions,
  forgeNow,
  forgeRecipes,
  forgeWeapons,
  gameText,
  getWorldNow,
  initialCrafterId,
  inventory,
  materialDataMap,
  nameText,
  openCookingRecipes,
  partyCharacterIds,
  processingRecipes,
  random,
  reliquaryPieceEntryMap,
  screenKind,
  wallet,
  weaponDataMap,
  worldNow,
} = defineProps<Props>();
const emit = defineEmits<{
  achievementEvents: [achievementEvents: AchievementEvent[]];
  close: [];
  updateInventory: [inventory: Inventory];
  updateWallet: [wallet: Wallet];
}>();
</script>

<template>
  <CookingScreen
    v-if="screenKind === ScreenKind.Cooking && cookingRecipe"
    v-model:progress="cookingProgress"
    v-model:recipe="cookingRecipe"
    :avatar-id="activeCharacterId"
    :game-text="gameText"
    :inventory="inventory"
    :material-data-map="materialDataMap"
    :name-text="nameText"
    :random="random"
    :recipes="openCookingRecipes"
    :talent="cookingTalents[activeCharacterId]"
    @close="emit('close')"
    @update:inventory="(nextInventory) => emit('updateInventory', nextInventory)"
  />
  <ProcessingScreen
    v-if="screenKind === ScreenKind.Processing"
    v-model:jobs="processingJobs"
    :game-text="gameText"
    :inventory="inventory"
    :material-data-map="materialDataMap"
    :name-text="nameText"
    :now="getWorldNow"
    :recipes="processingRecipes"
    @close="emit('close')"
    @update:inventory="(nextInventory) => emit('updateInventory', nextInventory)"
  />
  <CraftingScreen
    v-if="screenKind === ScreenKind.Crafting"
    v-model:crafted-count-map="craftedCountMap"
    :adventure-rank="adventureRank"
    :artifact-drop-tables="craftingArtifactDropTables"
    :crafters="crafters"
    :game-text="gameText"
    :get-world-now="getWorldNow"
    :initial-crafter-id="initialCrafterId"
    :inventory="inventory"
    :material-data-map="materialDataMap"
    :name-text="nameText"
    :now="worldNow"
    :progress="craftingProgress"
    :random="random"
    :recipes="craftingRecipes"
    :reliquary-piece-entry-map="reliquaryPieceEntryMap"
    :strongboxes="craftingStrongboxes"
    :wallet="wallet"
    :weapon-data-map="weaponDataMap"
    @achievement-events="(achievementEvents) => emit('achievementEvents', achievementEvents)"
    @close="emit('close')"
    @update:inventory="(nextInventory) => emit('updateInventory', nextInventory)"
    @update:wallet="(nextWallet) => emit('updateWallet', nextWallet)"
  />
  <ForgeScreen
    v-if="screenKind === ScreenKind.Forge"
    v-model:adventure-exp="adventureExp"
    v-model:amount="forgeAmount"
    v-model:progress="forgeProgress"
    v-model:recipe-id="forgeRecipeId"
    v-model:tab="forgeTab"
    :adventure-rank="adventureRank"
    :adventure-rank-tables="adventureRankTables"
    :completed-main-quest-ids="completedMainQuestIds"
    :definitions="forgeDefinitions"
    :game-text="gameText"
    :inventory="inventory"
    :is-in-realm="false"
    :now="forgeNow"
    :party-character-ids="partyCharacterIds"
    :random="random"
    :recipes="forgeRecipes"
    :wallet="wallet"
    :weapons="forgeWeapons"
    @achievement-events="(achievementEvents) => emit('achievementEvents', achievementEvents)"
    @close="emit('close')"
    @update:inventory="(nextInventory) => emit('updateInventory', nextInventory)"
    @update:wallet="(nextWallet) => emit('updateWallet', nextWallet)"
  />
</template>
