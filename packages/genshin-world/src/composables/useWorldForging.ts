import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { Ref } from "vue";

import { ScreenKind } from "#src/models/screen/ScreenKind";
import { computeForgeDefinitions } from "#src/services/forging/computeForgeDefinitions";
import { computeForgeWeapons } from "#src/services/forging/computeForgeWeapons";
import { FIRST_FORGE_RECIPE_ID, FORGE_CLOCK_INTERVAL_MS } from "#src/services/forging/constants";
import { createForgeProgress } from "#src/services/forging/createForgeProgress";
import { readForgeRecipes } from "#src/services/forging/readForgeRecipes";
import { readMondstadtBlacksmithPlace } from "#src/services/forging/readMondstadtBlacksmithPlace";
import { getResultAsync } from "@esposter/shared";
import { useIntervalFn } from "@vueuse/core";
import { ForgeTab } from "genshin-interface";
import { computed, ref, shallowRef } from "vue";

// The blacksmith's recipes and its place in Mondstadt as the world starts, each read from the hosted game data
export const useWorldForging = ({
  gameDataBaseUrl,
  getWorldNow,
  materialDataMap,
  nameText,
  screenKind,
  weaponDataMap,
}: {
  gameDataBaseUrl: string;
  getWorldNow: () => Temporal.Instant;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
  screenKind: Ref<ScreenKind>;
  weaponDataMap: ReadonlyMap<number, WeaponData>;
}) => {
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
  // The forge's state for this session: the save holds no forge slice, so a reload empties it, and its clock is read
  // Again each Interval while the forge screen is open so its queues' time left moves
  const forgeAmount = ref(1);
  const forgeDefinitions = computed(() => computeForgeDefinitions(forgeRecipes.value, materialDataMap, nameText));
  const forgeNow = shallowRef(getWorldNow());
  const forgeProgress = shallowRef(createForgeProgress(getWorldNow()));
  const forgeRecipeId = ref(FIRST_FORGE_RECIPE_ID);
  const forgeTab = ref(ForgeTab.Materials);
  const forgeWeapons = computed(() => computeForgeWeapons(forgeRecipes.value, weaponDataMap, nameText));
  useIntervalFn(() => {
    if (screenKind.value === ScreenKind.Forge) forgeNow.value = getWorldNow();
  }, FORGE_CLOCK_INTERVAL_MS);
  return {
    blacksmithPlace,
    forgeAmount,
    forgeDefinitions,
    forgeNow,
    forgeProgress,
    forgeRecipeId,
    forgeRecipes,
    forgeTab,
    forgeWeapons,
  };
};
