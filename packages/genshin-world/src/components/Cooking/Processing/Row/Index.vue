<script setup lang="ts">
import type { ProcessingRecipe } from "#src/models/cooking/ProcessingRecipe";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { GameText } from "genshin-text";

import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { GameButton, GameButtonKind } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // Whether the picked units can be started now, from the bag and the queue as they stand
  isStartable: boolean;
  // The game's material table by item id, which each result and ingredient is defined from
  materialDataMap: ReadonlyMap<number, MaterialData>;
  // The names of the items and recipes in the reader's language, by their game text ids
  nameText: Readonly<Record<string, string>>;
  // The units of it the queue holds already
  queuedCount: number;
  // The processing this row offers
  recipe: ProcessingRecipe;
}

// The units the player picked for this processing, one until picked
const count = defineModel<number>("count");
const { materialDataMap, nameText } = defineProps<Props>();
const emit = defineEmits<{ start: [] }>();
const getDefinition = (itemId: number) => getItemDefinition(itemId, nameText, materialDataMap);
</script>

<template>
  <li>
    <span>{{ nameText[recipe.nameTextId] }}</span>
    <span>{{ getDefinition(recipe.result.id).name }} x{{ recipe.result.count }}</span>
    <span v-for="ingredient in recipe.ingredients" :key="ingredient.id">
      {{ getDefinition(ingredient.id).name }} x{{ ingredient.count }}
    </span>
    <span>{{ queuedCount }} / {{ recipe.queueSize }}</span>
    <input
      v-model.number="count"
      :aria-label="gameText[GameTextKey.CraftingAmount]"
      min="1"
      type="number"
      :max="recipe.queueSize - queuedCount"
    />
    <GameButton :disabled="!isStartable" :kind="GameButtonKind.Row" tip="" @click="emit('start')">
      {{ gameText[GameTextKey.ProcessingStart] }}
    </GameButton>
  </li>
</template>
