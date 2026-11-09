<script setup lang="ts">
import type { CraftingCell } from "#src/models/CraftingCell";
import type { CraftingMaterial } from "#src/models/CraftingMaterial";

import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";
import { GAME_WHITE } from "#src/services/constants";

interface Props {
  // The amount slider's name for assistive tech
  amountLabel: string;
  // The most a recipe crafts at once
  amountMaximum: number;
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
  // The recipe list in the game's order, the picked one's name is the title
  recipes: CraftingCell[];
  // The coins the picked recipe costs for its amount
  requiredCoins: number;
  // The Required line's label
  requiredLabel: string;
}

const amount = defineModel<number>("amount", { default: 1 });
const crafterId = defineModel<number>("crafterId", { default: 0 });
const recipeId = defineModel<number>("recipeId", { default: 0 });
const { recipes } = defineProps<Props>();
const emit = defineEmits<{ craft: [] }>();
const pickedRecipeName = computed(() => recipes.find((recipe) => recipe.id === recipeId.value)?.name ?? "");
</script>

<template>
  <div class="detail">
    <div class="materials-band" aria-hidden="true" />
    <p class="recipe-title">{{ pickedRecipeName }}</p>
    <ul class="crafters">
      <li v-for="{ id, name } of crafters" :key="id">
        <GameButton
          class="crafter"
          :aria-pressed="id === crafterId"
          :kind="GameButtonKind.Row"
          tip=""
          @click="crafterId = id"
        >
          <span class="crafter-name">{{ name }}</span>
        </GameButton>
      </li>
    </ul>
    <input v-model.number="amount" :aria-label="amountLabel" class="amount" :max="amountMaximum" min="1" type="range" />
    <p class="crafted">{{ craftedLabel }}</p>
    <p class="required">{{ requiredLabel }} {{ requiredCoins }}</p>
    <p class="materials-label">{{ craftingMaterialsLabel }}</p>
    <ul class="materials">
      <li v-for="{ id, owned, required } of materials" :key="id" class="material">{{ owned }} / {{ required }}</li>
    </ul>
    <GameButton class="craft" :kind="GameButtonKind.Row" tip="" @click="emit('craft')">{{ craftLabel }}</GameButton>
  </div>
</template>

<style scoped>
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
}

.amount::-webkit-slider-runnable-track {
  background: #2d4159;
}

.amount::-webkit-slider-thumb {
  background: #fff7ea;
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
  border-radius: calc(var(--unit) * 4);
  background: #fff7ea;
  color: #212121;
  font-size: calc(var(--unit) * 22);
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
  width: 100%;
  height: calc(var(--unit) * 134);
  background: #3b4558;
}

.crafter[aria-pressed="true"] {
  outline: calc(var(--unit) * 2) solid v-bind(GAME_WHITE);
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
</style>

<style scoped src="../../../styles/craftingShop.css"></style>
