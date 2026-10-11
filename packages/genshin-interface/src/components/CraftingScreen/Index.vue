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
  <!-- The Craft screen, its pieces placed in the game's own pixels at 1080 high (`--unit` a pixel of that frame): the title
       and the coins across the head, the way out at the head's right, and the recipe tabs under the title. The screen takes its
       place from the game's layout, not a two-column grid, since its recipe list is narrower than its detail -->
  <div class="crafting-screen">
    <header class="head">
      <p class="title" role="heading" aria-level="1">{{ title }}</p>
      <p class="coins">
        <span class="coin" aria-hidden="true" />
        {{ coins }}
      </p>
      <button class="close" :aria-label="closeLabel" type="button" @click="emit('close')">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6 18 18M18 6 6 18" />
        </svg>
      </button>
    </header>
    <ul class="tabs">
      <li v-for="tab of tabs" :key="tab.id">
        <button class="tab" :aria-pressed="tab.id === tabId" type="button" @click="tabId = tab.id">
          <span class="tab-name">{{ tab.name }}</span>
        </button>
      </li>
    </ul>
    <div class="list">
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
  position: absolute;
  inset: 0;
  color: #fff7ea;
}

.head {
  position: absolute;
  inset: 0 0 auto;
  height: calc(var(--unit) * 95);
  background: #161c31;
}

.title {
  position: absolute;
  top: calc(var(--unit) * 30);
  left: calc(var(--unit) * 145);
  margin: 0;
  font-size: calc(var(--unit) * 22);
  line-height: calc(var(--unit) * 32);
}

.coins {
  position: absolute;
  top: calc(var(--unit) * 34);
  left: calc(var(--unit) * 1650);
  margin: 0;
  font-size: calc(var(--unit) * 22);
  line-height: calc(var(--unit) * 26);
}

.coin {
  position: absolute;
  top: calc(var(--unit) * 4);
  left: calc(var(--unit) * -30);
  width: calc(var(--unit) * 20);
  height: calc(var(--unit) * 20);
  border-radius: 50%;
  background: #e6b84a;
}

.close {
  position: absolute;
  top: calc(var(--unit) * 18);
  left: calc(var(--unit) * 1828);
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #fdfdfd;
  box-shadow: 0 0 calc(var(--unit) * 3) calc(var(--unit) * 1) rgb(0 0 0 / 0.3);
  cursor: inherit;
}

.close svg {
  width: calc(var(--unit) * 24);
  height: calc(var(--unit) * 24);
  fill: none;
  stroke: #212121;
  stroke-linecap: round;
  stroke-width: 3;
}

.tabs {
  position: absolute;
  top: calc(var(--unit) * 24);
  left: calc(var(--unit) * 822);
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tab {
  width: calc(var(--unit) * 96);
  height: calc(var(--unit) * 68);
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  cursor: inherit;
}

.tab[aria-pressed="true"] {
  border-bottom: calc(var(--unit) * 4) solid #e8d9b0;
}

.tab-name {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
</style>
