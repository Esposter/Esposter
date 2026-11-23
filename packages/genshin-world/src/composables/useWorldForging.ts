/* oxlint-disable typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot
   reject and nothing waits on it */
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";
import type { Ref } from "vue";

import { ScreenKind } from "#src/models/screen/ScreenKind";
import { computeForgeDefinitions } from "#src/services/forging/computeForgeDefinitions";
import { computeForgeWeapons } from "#src/services/forging/computeForgeWeapons";
import { FIRST_FORGE_RECIPE_ID, FORGE_CLOCK_INTERVAL_MS } from "#src/services/forging/constants";
import { readMondstadtBlacksmithPlace } from "#src/services/forging/readMondstadtBlacksmithPlace";
import { createUnlockItemMap } from "#src/services/shared/createUnlockItemMap";
import { useWorldScreenStore } from "#src/store/screen";
import { useWorldSessionStore } from "#src/store/session";
import { getResultAsync } from "@esposter/shared";
import { useIntervalFn } from "@vueuse/core";
import { ForgeTab } from "genshin-interface";
import { storeToRefs } from "pinia";
import { computed, ref, shallowRef } from "vue";

// The blacksmith's recipes, which the screen records hold as the forge opens, and its place in Mondstadt as the world
// Starts, Read from the hosted game data, and the recipe each diagram opens, by the diagram's item id
export const useWorldForging = ({
  forgeRecipeRecord,
}: {
  forgeRecipeRecord: Readonly<Ref<ForgeRecipe[] | undefined>>;
}) => {
  const worldScreenStore = useWorldScreenStore();
  const { screenKind } = storeToRefs(worldScreenStore);
  const worldSessionStore = useWorldSessionStore();
  const { getWorldNow } = worldSessionStore;
  const forgeRecipes = computed(() => forgeRecipeRecord.value ?? []);
  const blacksmithPlace = shallowRef<SceneGroupPlace | undefined>();
  getResultAsync(() => readMondstadtBlacksmithPlace(worldSessionStore.gameDataBaseUrl)).match(
    (place) => {
      blacksmithPlace.value = place;
    },
    (error) => {
      console.error(error);
    },
  );
  // The forge's state for this session: the save holds the recipes learned, not the queues, so a reload empties them,
  // And its Clock is read again each Interval while the forge screen is open so its queues' time left moves
  const forgeAmount = ref(1);
  const forgeDefinitions = computed(() =>
    computeForgeDefinitions(forgeRecipes.value, worldSessionStore.materialDataMap, worldSessionStore.nameText),
  );
  const forgeNow = shallowRef(getWorldNow());
  const forgeRecipeId = ref(FIRST_FORGE_RECIPE_ID);
  const forgeRecipeMap = computed(() => createUnlockItemMap(forgeRecipes.value));
  const forgeTab = ref(ForgeTab.Materials);
  const forgeWeapons = computed(() =>
    computeForgeWeapons(forgeRecipes.value, worldSessionStore.weaponDataMap, worldSessionStore.nameText),
  );
  useIntervalFn(() => {
    if (screenKind.value === ScreenKind.Forge) forgeNow.value = getWorldNow();
  }, FORGE_CLOCK_INTERVAL_MS);
  return {
    blacksmithPlace,
    forgeAmount,
    forgeDefinitions,
    forgeNow,
    forgeRecipeId,
    forgeRecipeMap,
    forgeRecipes,
    forgeTab,
    forgeWeapons,
  };
};
