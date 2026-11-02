<script setup lang="ts">
import type { AchievementEvent } from "#src/models/achievement/AchievementEvent";
import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { ArtifactDropTables } from "#src/models/chest/ArtifactDropTables";
import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { CookingTalent } from "#src/models/cooking/CookingTalent";
import type { ProcessingJob } from "#src/models/cooking/ProcessingJob";
import type { ProcessingRecipe } from "#src/models/cooking/ProcessingRecipe";
import type { CraftingProgress } from "#src/models/crafting/CraftingProgress";
import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";
import type { CraftingStrongboxData } from "#src/models/crafting/CraftingStrongboxData";
import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { CraftingCell, ForgeTab } from "genshin-interface";
import type { GameText } from "genshin-text";

import ProcessingScreen from "#src/components/Cooking/Processing/Index.vue";
import CookingScreen from "#src/components/Cooking/Screen/Index.vue";
import CraftingScreen from "#src/components/Crafting/Screen/Index.vue";
import ForgeScreen from "#src/components/Forge/Screen/Index.vue";
import { ScreenKind } from "#src/models/screen/ScreenKind";

interface Props {
  adventureRank: number;
  adventureRankTables: AdventureRankTables;
  artifactDropTables: ArtifactDropTables;
  avatarId: number;
  completedMainQuestIds: ReadonlySet<string>;
  cookingRecipes: CookingRecipe[];
  crafters: CraftingCell[];
  craftingProgress: CraftingProgress;
  craftingRecipes: CraftingRecipe[];
  forgeDefinitions: Map<number, ItemDefinition>;
  forgeNow: Temporal.Instant;
  forgeRecipes: ForgeRecipe[];
  forgeWeapons: Map<number, Pick<ItemDefinition, "name"> & WeaponData>;
  gameText: GameText;
  getWorldNow: () => Temporal.Instant;
  initialCrafterId: number;
  inventory: Inventory;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
  partyCharacterIds: number[];
  processingRecipes: ProcessingRecipe[];
  random: () => number;
  reliquaryPieceEntryMap: ReadonlyMap<number, ReliquaryPieceEntry>;
  screenKind: ScreenKind;
  strongboxes: CraftingStrongboxData[];
  // The talent of the character on the field, which the cooking screen's kit reads
  talent?: CookingTalent;
  wallet: Wallet;
  weaponDataMap: ReadonlyMap<number, WeaponData>;
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
  adventureRank,
  adventureRankTables,
  artifactDropTables,
  avatarId,
  completedMainQuestIds,
  cookingRecipes,
  crafters,
  craftingProgress,
  craftingRecipes,
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
  partyCharacterIds,
  processingRecipes,
  random,
  reliquaryPieceEntryMap,
  screenKind,
  strongboxes,
  talent,
  wallet,
  weaponDataMap,
  worldNow,
} = defineProps<Props>();
const emit = defineEmits<{
  achievementEvents: [achievementEvents: AchievementEvent[]];
  close: [];
  "update:inventory": [inventory: Inventory];
  "update:wallet": [wallet: Wallet];
}>();
</script>

<template>
  <CookingScreen
    v-if="screenKind === ScreenKind.Cooking && cookingRecipe"
    v-model:progress="cookingProgress"
    v-model:recipe="cookingRecipe"
    :avatar-id
    :game-text
    :inventory
    :material-data-map
    :name-text
    :random
    :recipes="cookingRecipes"
    :talent
    @close="emit('close')"
    @update:inventory="(nextInventory) => emit('update:inventory', nextInventory)"
  />
  <ProcessingScreen
    v-if="screenKind === ScreenKind.Processing"
    v-model:jobs="processingJobs"
    :game-text
    :inventory
    :material-data-map
    :name-text
    :now="getWorldNow"
    :recipes="processingRecipes"
    @close="emit('close')"
    @update:inventory="(nextInventory) => emit('update:inventory', nextInventory)"
  />
  <CraftingScreen
    v-if="screenKind === ScreenKind.Crafting"
    v-model:crafted-count-map="craftedCountMap"
    :adventure-rank
    :artifact-drop-tables
    :crafters
    :game-text
    :get-world-now
    :initial-crafter-id
    :inventory
    :material-data-map
    :name-text
    :now="worldNow"
    :progress="craftingProgress"
    :random
    :recipes="craftingRecipes"
    :reliquary-piece-entry-map
    :strongboxes
    :wallet
    :weapon-data-map
    @achievement-events="(achievementEvents) => emit('achievementEvents', achievementEvents)"
    @close="emit('close')"
    @update:inventory="(nextInventory) => emit('update:inventory', nextInventory)"
    @update:wallet="(nextWallet) => emit('update:wallet', nextWallet)"
  />
  <ForgeScreen
    v-if="screenKind === ScreenKind.Forge"
    v-model:adventure-exp="adventureExp"
    v-model:amount="forgeAmount"
    v-model:progress="forgeProgress"
    v-model:recipe-id="forgeRecipeId"
    v-model:tab="forgeTab"
    :adventure-rank
    :adventure-rank-tables
    :completed-main-quest-ids
    :definitions="forgeDefinitions"
    :game-text
    :inventory
    :is-in-realm="false"
    :now="forgeNow"
    :party-character-ids
    :random
    :recipes="forgeRecipes"
    :wallet
    :weapons="forgeWeapons"
    @achievement-events="(achievementEvents) => emit('achievementEvents', achievementEvents)"
    @close="emit('close')"
    @update:inventory="(nextInventory) => emit('update:inventory', nextInventory)"
    @update:wallet="(nextWallet) => emit('update:wallet', nextWallet)"
  />
</template>
