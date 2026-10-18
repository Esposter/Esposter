<script setup lang="ts">
import type { ProcessingJob } from "#src/models/cooking/ProcessingJob";
import type { ProcessingRecipe } from "#src/models/cooking/ProcessingRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { GameText } from "genshin-text";

import { collectProcessingJobs } from "#src/services/cooking/collectProcessingJobs";
import { startProcessing } from "#src/services/cooking/startProcessing";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The game's material table by item id, which each result and ingredient is defined from
  materialDataMap: ReadonlyMap<number, MaterialData>;
  // The names of the items and recipes in the reader's language, by their game text ids
  nameText: Readonly<Record<string, string>>;
  // The world's clock, which the queues are read against
  now: () => Temporal.Instant;
  // Every processing the stove holds; the ones known from the start are offered
  recipes: ProcessingRecipe[];
}

const { gameText, materialDataMap, nameText, now, recipes } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const inventory = defineModel<Inventory>("inventory", { required: true });
const jobs = defineModel<Record<number, ProcessingJob>>("jobs", { required: true });
// The processings offered: only the ones known from the start, since a processing not yet known is refused
const knownRecipes = recipes.filter((recipe) => recipe.isDefaultUnlocked);
// The units the player picked for each processing, one until picked
const counts = ref<Record<number, number>>({});
const COLLECT_INTERVAL_MS = 1000;
const getDefinition = (itemId: number) => getItemDefinition(itemId, nameText, materialDataMap);
const pickedCount = (recipe: ProcessingRecipe) => counts.value[recipe.id] ?? 1;
const queuedCount = (recipe: ProcessingRecipe) => jobs.value[recipe.id]?.count ?? 0;
const canStart = (recipe: ProcessingRecipe) =>
  startProcessing(recipe, pickedCount(recipe), {
    inventory: inventory.value,
    job: jobs.value[recipe.id],
    now: now(),
  }) !== undefined;
// The units done by now go into the bag, and the queues keep the rest, as the screen opens and while it is open
const collect = () => {
  const collected = collectProcessingJobs(recipes, jobs.value, {
    getResultDefinition: getDefinition,
    inventory: inventory.value,
    now: now(),
  });
  if (collected.inventory !== inventory.value) inventory.value = collected.inventory;
  jobs.value = collected.jobs;
};
let timer: ReturnType<typeof setInterval> | undefined;
onMounted(() => {
  collect();
  timer = setInterval(collect, COLLECT_INTERVAL_MS);
});
onBeforeUnmount(() => {
  clearInterval(timer);
});
// Queue the picked units of a processing, their ingredients taken from the bag at once
const start = (recipe: ProcessingRecipe) => {
  const started = startProcessing(recipe, pickedCount(recipe), {
    inventory: inventory.value,
    job: jobs.value[recipe.id],
    now: now(),
  });
  if (!started) return;
  inventory.value = started.inventory;
  jobs.value = { ...jobs.value, [recipe.id]: started.job };
};
</script>

<template>
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.ProcessingStart]">
    <div>
      <h2>{{ gameText[GameTextKey.ProcessingStart] }}</h2>
      <ul>
        <li v-for="recipe in knownRecipes" :key="recipe.id">
          <span>{{ nameText[recipe.nameTextId] }}</span>
          <span>{{ getDefinition(recipe.result.id).name }} x{{ recipe.result.count }}</span>
          <span v-for="ingredient in recipe.ingredients" :key="ingredient.id">
            {{ getDefinition(ingredient.id).name }} x{{ ingredient.count }}
          </span>
          <span>{{ queuedCount(recipe) }} / {{ recipe.queueSize }}</span>
          <input
            v-model.number="counts[recipe.id]"
            :aria-label="gameText[GameTextKey.CraftingAmount]"
            min="1"
            type="number"
            :max="recipe.queueSize - queuedCount(recipe)"
          />
          <button type="button" :disabled="!canStart(recipe)" @click="start(recipe)">
            {{ gameText[GameTextKey.ProcessingStart] }}
          </button>
        </li>
      </ul>
      <button type="button" @click="emit('close')">{{ gameText[GameTextKey.Back] }}</button>
    </div>
  </GameScreen>
</template>
