<script setup lang="ts">
import type { CraftingCell } from "#src/models/CraftingCell";
import type { CraftingMaterial } from "#src/models/CraftingMaterial";

import DiscButton from "#src/components/DiscButton/Index.vue";
import ScreenTitle from "#src/components/ScreenTitle/Index.vue";

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
    <header class="head">
      <ScreenTitle class="heading" role="heading" aria-level="1">{{ title }}</ScreenTitle>
      <p class="coins">
        <span class="coin" aria-hidden="true" />
        {{ coins }}
      </p>
      <DiscButton class="close" :label="closeLabel" :size="56" @click="emit('close')">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6 18 18M18 6 6 18" />
        </svg>
      </DiscButton>
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
            <span v-if="recipe.count !== undefined" class="recipe-count">{{ recipe.count }}</span>
          </button>
        </li>
      </ul>
    </div>
    <div class="detail">
      <div class="materials-band" aria-hidden="true" />
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
      <ul class="materials">
        <li v-for="material of materials" :key="material.id" class="material">
          {{ material.owned }} / {{ material.required }}
        </li>
      </ul>
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

.heading {
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

.list {
  position: absolute;
  top: calc(var(--unit) * 120);
  left: calc(var(--unit) * 66);
  width: calc(var(--unit) * 580);
}

.recipes {
  display: grid;
  grid-template-columns: repeat(4, calc(var(--unit) * 127));
  gap: calc(var(--unit) * 21) calc(var(--unit) * 19);
  margin: 0;
  padding: 0;
  list-style: none;
}

.recipe {
  position: relative;
  width: 100%;
  height: calc(var(--unit) * 152);
  padding: 0;
  border: none;
  border-radius: calc(var(--unit) * 3);
  background: #54658c;
  color: inherit;
  cursor: inherit;
}

.recipe[aria-pressed="true"] {
  outline: calc(var(--unit) * 2) solid #fdfdfd;
}

.recipe-count {
  position: absolute;
  top: calc(var(--unit) * 4);
  right: calc(var(--unit) * 4);
  font-size: calc(var(--unit) * 14);
}

.recipe-name {
  position: absolute;
  right: calc(var(--unit) * 4);
  bottom: calc(var(--unit) * 4);
  left: calc(var(--unit) * 4);
  overflow: hidden;
  font-size: calc(var(--unit) * 17);
  line-height: calc(var(--unit) * 20);
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail {
  position: absolute;
  inset: 0;
}

.recipe-title {
  position: absolute;
  top: calc(var(--unit) * 113);
  left: calc(var(--unit) * 1020);
  width: calc(var(--unit) * 570);
  margin: 0;
  font-size: calc(var(--unit) * 28);
  font-weight: 600;
  line-height: calc(var(--unit) * 36);
  text-align: center;
}

.materials-band {
  position: absolute;
  top: calc(var(--unit) * 745);
  left: calc(var(--unit) * 735);
  width: calc(var(--unit) * 1143);
  height: calc(var(--unit) * 213);
  background: #3e4860;
}

.materials-label {
  position: absolute;
  top: calc(var(--unit) * 756);
  left: calc(var(--unit) * 788);
  margin: 0;
  font-size: calc(var(--unit) * 20);
  line-height: calc(var(--unit) * 24);
}

.materials {
  position: absolute;
  top: calc(var(--unit) * 810);
  left: calc(var(--unit) * 983);
  display: flex;
  gap: calc(var(--unit) * 24);
  margin: 0;
  padding: 0;
  list-style: none;
}

.material {
  display: grid;
  width: calc(var(--unit) * 112);
  height: calc(var(--unit) * 132);
  background: #4d6786;
  font-size: calc(var(--unit) * 18);
  place-items: end center;
}

.amount {
  position: absolute;
  top: calc(var(--unit) * 666);
  left: calc(var(--unit) * 1120);
  width: calc(var(--unit) * 365);
  height: calc(var(--unit) * 14);
  margin: 0;
  appearance: none;
  background: transparent;
  cursor: inherit;
}

.amount::-webkit-slider-runnable-track {
  height: calc(var(--unit) * 4);
  background: #2d4159;
}

.amount::-webkit-slider-thumb {
  width: calc(var(--unit) * 14);
  height: calc(var(--unit) * 14);
  margin-top: calc(var(--unit) * -5);
  border-radius: calc(var(--unit) * 2);
  background: #fff7ea;
  transform: rotate(45deg);
  appearance: none;
}

.crafted,
.required {
  position: absolute;
  left: calc(var(--unit) * 1020);
  width: calc(var(--unit) * 570);
  margin: 0;
  font-size: calc(var(--unit) * 22);
  line-height: calc(var(--unit) * 26);
  text-align: center;
}

.crafted {
  top: calc(var(--unit) * 622);
}

.required {
  top: calc(var(--unit) * 700);
}

.craft {
  position: absolute;
  top: calc(var(--unit) * 990);
  left: calc(var(--unit) * 1636);
  width: calc(var(--unit) * 224);
  height: calc(var(--unit) * 50);
  padding: 0;
  border: none;
  border-radius: calc(var(--unit) * 4);
  background: #fff7ea;
  color: #212121;
  font-size: calc(var(--unit) * 22);
  cursor: inherit;
}

.crafters {
  position: absolute;
  top: calc(var(--unit) * 808);
  left: calc(var(--unit) * 1517);
  width: calc(var(--unit) * 111);
  margin: 0;
  padding: 0;
  list-style: none;
}

.crafter {
  position: relative;
  width: 100%;
  height: calc(var(--unit) * 134);
  padding: 0;
  border: none;
  background: #3b4558;
  color: inherit;
  cursor: inherit;
}

.crafter[aria-pressed="true"] {
  outline: calc(var(--unit) * 2) solid #fdfdfd;
}

.crafter-name {
  position: absolute;
  right: 0;
  bottom: calc(var(--unit) * 4);
  left: 0;
  font-size: calc(var(--unit) * 18);
  line-height: calc(var(--unit) * 22);
  text-align: center;
}

.tab-name {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
</style>
