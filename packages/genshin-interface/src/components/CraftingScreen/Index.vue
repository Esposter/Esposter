<script setup lang="ts">
import type { CraftingCell } from "#src/models/CraftingCell";

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
  recipes,
  requiredCoins,
  requiredLabel,
  tabs,
  title,
} = defineProps<Props>();
const emit = defineEmits<{ close: []; craft: [] }>();
</script>

<template>
  <!-- The crafting bench, the Craft screen: the recipes on the left, the picked one's icon, count and cost on the right,
       and the way out and the coins across the head. Provisional: every place, size and colour waits on the crafting
       screen's passes against the public clip of the Crafting Table (references/crafting-screen) -->
  <div class="crafting-screen">
    <header class="head">
      <p class="title" role="heading" aria-level="1">{{ title }}</p>
      <p class="coins">{{ coins }}</p>
      <button class="close" :aria-label="closeLabel" type="button" @click="emit('close')">×</button>
    </header>
    <div class="list">
      <ul class="tabs">
        <li v-for="tab of tabs" :key="tab.id">
          <button class="tab" :aria-pressed="tab.id === tabId" type="button" @click="tabId = tab.id">
            <span class="tab-name">{{ tab.name }}</span>
          </button>
        </li>
      </ul>
      <ul class="recipes">
        <li v-for="recipe of recipes" :key="recipe.id">
          <button class="recipe" :aria-pressed="recipe.id === recipeId" type="button" @click="recipeId = recipe.id">
            <span class="recipe-name">{{ recipe.name }}</span>
          </button>
        </li>
      </ul>
    </div>
    <div class="detail">
      <p class="recipe-title">{{ recipes.find((recipe) => recipe.id === recipeId)?.name }}</p>
      <ul class="crafters">
        <li v-for="crafter of crafters" :key="crafter.id">
          <button
            class="crafter"
            :aria-pressed="crafter.id === crafterId"
            type="button"
            @click="crafterId = crafter.id"
          >
            <span class="crafter-name">{{ crafter.name }}</span>
          </button>
        </li>
      </ul>
      <input
        v-model.number="amount"
        :aria-label="amountLabel"
        class="amount"
        :max="amountMaximum"
        min="1"
        type="range"
      />
      <p class="crafted">{{ craftedLabel }}</p>
      <p class="required">{{ requiredLabel }} {{ requiredCoins }}</p>
      <p class="materials-label">{{ craftingMaterialsLabel }}</p>
      <button class="craft" type="button" @click="emit('craft')">{{ craftLabel }}</button>
    </div>
  </div>
</template>

<style scoped>
.crafting-screen {
  position: relative;
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  color: #ece5d8;
}

.head {
  grid-column: 1 / -1;
}
</style>
