import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";

import { readForgeRecipes } from "#src/services/forging/readForgeRecipes";
import { readMondstadtBlacksmithPlace } from "#src/services/forging/readMondstadtBlacksmithPlace";
import { getResultAsync } from "@esposter/shared";
import { shallowRef } from "vue";

// The blacksmith's recipes and its place in Mondstadt as the world starts, each read from the hosted game data
export const useWorldForging = (gameDataBaseUrl: string) => {
  const forgeRecipes = shallowRef<ForgeRecipe[]>([]);
  const blacksmithPlace = shallowRef<SceneGroupPlace | undefined>();
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => readForgeRecipes(gameDataBaseUrl)).match(
    (recipes) => {
      forgeRecipes.value = recipes;
    },
    (error) => {
      console.error(error);
    },
  );
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => readMondstadtBlacksmithPlace(gameDataBaseUrl)).match(
    (place) => {
      blacksmithPlace.value = place;
    },
    (error) => {
      console.error(error);
    },
  );
  return { blacksmithPlace, forgeRecipes };
};
