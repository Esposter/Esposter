import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { ProcessingJob } from "#src/models/cooking/ProcessingJob";
import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";

import { readCookingRecipes } from "#src/services/cooking/readCookingRecipes";
import { readMondstadtCookingStovePlace } from "#src/services/cooking/readMondstadtCookingStovePlace";
import { createUnlockItemMap } from "#src/services/shared/createUnlockItemMap";
import { useWorldSessionStore } from "#src/store/session";
import { getResultAsync, getSynchronizedFunction } from "@esposter/shared";
import { defineStore } from "pinia";
import { computed, shallowRef } from "vue";

const createCookingProgress = (): CookingProgress => ({ learnedRecipeIds: [], proficiencies: {} });

// A read that fails is logged and left unset
const read = <T>(readTable: () => Promise<T>, setTable: (table: T) => void) => {
  getSynchronizedFunction(() =>
    getResultAsync(readTable).match(setTable, (error) => {
      console.error(error);
    }),
  )();
};

// The cooking recipes and the stove's place in Mondstadt, each Read from the hosted game data as the world starts, with
// The progress the save holds: the recipes learned and the Proficiency in each, and the processing jobs running. The
// Bag's use of an instruction item and the stove's prompt read It, and the session starts it before the save watches it
// And stops it as it unmounts
export const useWorldCookingStore = defineStore("world/cooking", () => {
  const worldSessionStore = useWorldSessionStore();
  const cookingProgress = shallowRef<CookingProgress>(createCookingProgress());
  const processingJobs = shallowRef<Record<number, ProcessingJob>>({});
  const cookingRecipes = shallowRef<CookingRecipe[]>([]);
  const cookingStovePlace = shallowRef<SceneGroupPlace>();
  const cookingRecipe = shallowRef<CookingRecipe>();
  // The dishes the cook knows at the stove, the one on the screen being the first of them when it opens
  const openCookingRecipes = shallowRef<CookingRecipe[]>([]);
  // The dish each instruction item teaches, by the item's id, read off the dishes' unlock items
  const instructionRecipeMap = computed(() => createUnlockItemMap(cookingRecipes.value));
  const start = (saved: { cookingProgress: CookingProgress; processingJobs: Record<number, ProcessingJob> }) => {
    ({ cookingProgress: cookingProgress.value, processingJobs: processingJobs.value } = saved);
    const { gameDataBaseUrl } = worldSessionStore;
    read(
      () => readCookingRecipes(gameDataBaseUrl),
      (recipes) => {
        cookingRecipes.value = recipes;
      },
    );
    read(
      () => readMondstadtCookingStovePlace(gameDataBaseUrl),
      (place) => {
        cookingStovePlace.value = place;
      },
    );
  };
  const stop = () => {
    cookingProgress.value = createCookingProgress();
    processingJobs.value = {};
    cookingRecipes.value = [];
    cookingStovePlace.value = undefined;
    cookingRecipe.value = undefined;
    openCookingRecipes.value = [];
  };

  return {
    cookingProgress,
    cookingRecipe,
    cookingRecipes,
    cookingStovePlace,
    instructionRecipeMap,
    openCookingRecipes,
    processingJobs,
    start,
    stop,
  };
});
