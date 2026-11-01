<script setup lang="ts">
import type { CraftingCell } from "#src/models/CraftingCell";

import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";
import { GAME_WHITE } from "#src/services/constants";

interface Props {
  // The recipe list in the game's order
  recipes: CraftingCell[];
}

const recipeId = defineModel<number>("recipeId", { default: 0 });
const { recipes } = defineProps<Props>();
</script>

<template>
  <div class="list">
    <ul class="recipes">
      <li v-for="recipe of recipes" :key="recipe.id">
        <GameButton
          class="recipe"
          :aria-pressed="recipe.id === recipeId"
          :kind="GameButtonKind.Row"
          tip=""
          @click="recipeId = recipe.id"
        >
          <span class="recipe-name">{{ recipe.name }}</span>
          <span v-if="recipe.count !== undefined" class="recipe-count">{{ recipe.count }}</span>
        </GameButton>
      </li>
    </ul>
  </div>
</template>

<style scoped>
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
  outline: calc(var(--unit) * 2) solid v-bind(GAME_WHITE);
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
</style>
