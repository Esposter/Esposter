import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { CookingTalent } from "#src/models/cooking/CookingTalent";
import type { ProcessingRecipe } from "#src/models/cooking/ProcessingRecipe";
import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";

import { readCookingRecipes } from "#src/services/cooking/readCookingRecipes";
import { readCookingTalents } from "#src/services/cooking/readCookingTalents";
import { readMondstadtCookingStovePlace } from "#src/services/cooking/readMondstadtCookingStovePlace";
import { readProcessingRecipes } from "#src/services/cooking/readProcessingRecipes";
import { getResultAsync } from "@esposter/shared";
import { shallowRef } from "vue";

// The cooking recipes, the processing recipes, the cooks' talents by character id and the stove's place in Mondstadt as
// The world starts, each read from the hosted game data
export const useWorldCooking = (gameDataBaseUrl: string) => {
  const cookingRecipes = shallowRef<CookingRecipe[]>([]);
  const cookingTalents = shallowRef<Record<string, CookingTalent>>({});
  const cookingStovePlace = shallowRef<SceneGroupPlace | undefined>();
  const processingRecipes = shallowRef<ProcessingRecipe[]>([]);
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => readCookingRecipes(gameDataBaseUrl)).match(
    (recipes) => {
      cookingRecipes.value = recipes;
    },
    (error) => {
      console.error(error);
    },
  );
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => readCookingTalents(gameDataBaseUrl)).match(
    (talents) => {
      cookingTalents.value = talents;
    },
    (error) => {
      console.error(error);
    },
  );
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => readProcessingRecipes(gameDataBaseUrl)).match(
    (recipes) => {
      processingRecipes.value = recipes;
    },
    (error) => {
      console.error(error);
    },
  );
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => readMondstadtCookingStovePlace(gameDataBaseUrl)).match(
    (place) => {
      cookingStovePlace.value = place;
    },
    (error) => {
      console.error(error);
    },
  );
  return { cookingRecipes, cookingStovePlace, cookingTalents, processingRecipes };
};
