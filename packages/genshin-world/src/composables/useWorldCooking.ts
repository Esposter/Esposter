import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";

import { readCookingRecipes } from "#src/services/cooking/readCookingRecipes";
import { readMondstadtCookingStovePlace } from "#src/services/cooking/readMondstadtCookingStovePlace";
import { getResultAsync } from "@esposter/shared";
import { shallowRef } from "vue";

// The cooking recipes and the stove's place in Mondstadt as the world starts, each read from the hosted game data
export const useWorldCooking = (gameDataBaseUrl: string) => {
  const cookingRecipes = shallowRef<CookingRecipe[]>([]);
  const cookingStovePlace = shallowRef<SceneGroupPlace | undefined>();
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
  getResultAsync(() => readMondstadtCookingStovePlace(gameDataBaseUrl)).match(
    (place) => {
      cookingStovePlace.value = place;
    },
    (error) => {
      console.error(error);
    },
  );
  return { cookingRecipes, cookingStovePlace };
};
