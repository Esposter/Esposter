<script setup lang="ts">
import type { ProcessingJob } from "#src/models/cooking/ProcessingJob";
import type { ProcessingRecipe } from "#src/models/cooking/ProcessingRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { GameText } from "genshin-text";

import ProcessingRow from "#src/components/Cooking/Processing/Row/Index.vue";
import { collectProcessingJobs } from "#src/services/cooking/collectProcessingJobs";
import { PROCESSING_COLLECT_INTERVAL_MS } from "#src/services/cooking/constants";
import { startProcessing } from "#src/services/cooking/startProcessing";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { GameButton, GameButtonKind, GameScreen } from "genshin-interface";
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

const inventory = defineModel<Inventory>("inventory", { required: true });
const jobs = defineModel<Record<number, ProcessingJob>>("jobs", { required: true });
const { gameText, materialDataMap, nameText, now, recipes } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
// The processings offered: only the ones known from the start, since a processing not yet known is refused
const knownRecipes = recipes.filter((recipe) => recipe.isDefaultUnlocked);
// The units the player picked for each processing, one until picked
const counts = ref<Record<number, number>>({});
const getDefinition = (itemId: number) => getItemDefinition(itemId, nameText, materialDataMap);
const pickedCount = (recipe: ProcessingRecipe) => counts.value[recipe.id] ?? 1;
const queuedCount = (recipe: ProcessingRecipe) => jobs.value[recipe.id]?.count ?? 0;
const checkCanStart = (recipe: ProcessingRecipe) =>
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
  timer = setInterval(collect, PROCESSING_COLLECT_INTERVAL_MS);
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
        <ProcessingRow
          v-for="recipe in knownRecipes"
          :key="recipe.id"
          v-model:count="counts[recipe.id]"
          :game-text
          :is-startable="checkCanStart(recipe)"
          :material-data-map
          :name-text
          :queued-count="queuedCount(recipe)"
          :recipe
          @start="start(recipe)"
        />
      </ul>
      <GameButton :kind="GameButtonKind.Row" tip="" @click="emit('close')">{{ gameText[GameTextKey.Back] }}</GameButton>
    </div>
  </GameScreen>
</template>
