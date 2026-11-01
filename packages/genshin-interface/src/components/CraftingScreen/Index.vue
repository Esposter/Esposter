<script setup lang="ts">
import type { CraftingCell } from "#src/models/CraftingCell";
import type { CraftingMaterial } from "#src/models/CraftingMaterial";

import CraftingScreenDetail from "#src/components/CraftingScreen/Detail/Index.vue";
import CraftingScreenHead from "#src/components/CraftingScreen/Head/Index.vue";
import CraftingScreenRecipes from "#src/components/CraftingScreen/Recipes/Index.vue";
import CraftingScreenTabs from "#src/components/CraftingScreen/Tabs/Index.vue";

interface Props {
  // The amount slider's name for assistive tech
  amountLabel: string;
  // The most a recipe crafts at once
  amountMaximum: number;
  // The close button's name for assistive tech, the game's "Back" line
  closeLabel: string;
  // The coins the wallet holds
  coins: number;
  // The Crafted-so-far line under the picked recipe, in the game's words
  craftedLabel: string;
  // The characters who can craft, in the party's order, one picked to cook the recipe
  crafters: CraftingCell[];
  // The Crafting Materials row's heading
  craftingMaterialsLabel: string;
  // The button that crafts the picked recipe for the chosen amount
  craftLabel: string;
  // The materials the picked recipe takes, each with the count the player holds and the count one craft takes
  materials: CraftingMaterial[];
  // The recipe list in the game's order
  recipes: CraftingCell[];
  // The coins the picked recipe costs for its amount
  requiredCoins: number;
  // The Required line's label
  requiredLabel: string;
  // The recipe tabs, one per combine type the bench holds, in the game's order
  tabs: CraftingCell[];
  // The title the game shows over the screen
  title: string;
}

const amount = defineModel<number>("amount", { default: 1 });
const crafterId = defineModel<number>("crafterId", { default: 0 });
const recipeId = defineModel<number>("recipeId", { default: 0 });
const tabId = defineModel<number>("tabId", { default: 0 });
const {
  amountLabel,
  amountMaximum,
  closeLabel,
  coins,
  craftedLabel,
  crafters,
  craftingMaterialsLabel,
  craftLabel,
  materials,
  recipes,
  requiredCoins,
  requiredLabel,
  tabs,
  title,
} = defineProps<Props>();
const emit = defineEmits<{ close: []; craft: [] }>();
</script>

<template>
  <!-- The Craft screen, its pieces placed in the game's own pixels at 1080 high (`--unit` a pixel of that frame): the title
       and the coins across the head, the way out at the head's right, and the recipe tabs under the title. The screen takes its
       place from the game's layout, not a two-column grid, since its recipe list is narrower than its detail -->
  <div class="crafting-screen">
    <CraftingScreenHead :close-label="closeLabel" :coins :title @close="emit('close')" />
    <CraftingScreenTabs v-model:tab-id="tabId" :tabs />
    <CraftingScreenRecipes v-model:recipe-id="recipeId" :recipes />
    <CraftingScreenDetail
      v-model:amount="amount"
      v-model:crafter-id="crafterId"
      v-model:recipe-id="recipeId"
      :amount-label="amountLabel"
      :amount-maximum="amountMaximum"
      :craft-label="craftLabel"
      :crafted-label="craftedLabel"
      :crafters
      :crafting-materials-label="craftingMaterialsLabel"
      :materials
      :recipes
      :required-coins="requiredCoins"
      :required-label="requiredLabel"
      @craft="emit('craft')"
    />
  </div>
</template>

<style scoped>
.crafting-screen {
  position: absolute;
  inset: 0;
  color: #fff7ea;
}
</style>
