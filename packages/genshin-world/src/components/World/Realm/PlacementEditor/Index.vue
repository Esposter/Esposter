<script setup lang="ts">
import type { HomeArea } from "#src/models/home/HomeArea";
import type { HomeFurnishing } from "#src/models/home/HomeFurnishing";
import type { HomePlacement } from "#src/models/home/HomePlacement";
import type { GameText } from "genshin-text";

import { HomeFurnishingLimit } from "#src/models/home/HomeFurnishingLimit";
import { computeHomeAreaLoad } from "#src/services/home/computeHomeAreaLoad";
import { computeHomeLoadState } from "#src/services/home/computeHomeLoadState";
import { getHomeAreaPlacements } from "#src/services/home/getHomeAreaPlacements";
import { getHomeFurnishingLimit } from "#src/services/home/getHomeFurnishingLimit";
import { placeHomeFurnishing } from "#src/services/home/placeHomeFurnishing";
import { GameButton, GameButtonKind, GameScreen, ProgressBar } from "genshin-interface";
import { GameTextKey } from "genshin-text";
import { computed, ref } from "vue";

interface Props {
  area: HomeArea;
  furnishings: HomeFurnishing[];
  gameText: GameText;
  // The furnishings the player holds, each by its item id and the name the bag shows it under
  held: { itemId: number; name: string }[];
  // Every placement the realm holds, in the order placed, across its areas
  placements: HomePlacement[];
  // The point on the ground the placement mode picked, where the furnishing would stand
  position: { x: number; y: number; z: number };
  // The turn the furnishing would face, in radians
  rotation: number;
}

const { area, furnishings, gameText, held, placements, position, rotation } = defineProps<Props>();
const emit = defineEmits<{ place: [placement: HomePlacement] }>();
const selectedItemId = ref<number>();
const itemIdFurnishingMap = computed(() => new Map(furnishings.map((furnishing) => [furnishing.itemId, furnishing])));
// The area's own placements, read by the placement's own filter, so the meter and the placement count the same set
const areaPlacements = computed(() => getHomeAreaPlacements(placements, area));
// The placement the picked furnishing would make at the picked point, undefined until a furnishing is picked
const candidate = computed<HomePlacement | undefined>(() =>
  selectedItemId.value === undefined
    ? undefined
    : { areaId: area.areaId, furnishingItemId: selectedItemId.value, position, rotation, sceneId: area.sceneId },
);
// The candidate when the realm would take it, undefined where the area's count or load would be passed
const placeable = computed<HomePlacement | undefined>(() => {
  if (candidate.value === undefined) return undefined;
  const isPlaced = placeHomeFurnishing(placements, candidate.value, { areas: [area], furnishings }) !== undefined;
  return isPlaced ? candidate.value : undefined;
});
// The load the area holds with the candidate on it, so the meter shows what a placement would bring it to
const shownLoad = computed(() =>
  computeHomeAreaLoad(
    candidate.value === undefined ? areaPlacements.value : [...areaPlacements.value, candidate.value],
    itemIdFurnishingMap.value,
  ),
);
// The notice for the limit the candidate would pass, in the game's own words for it, undefined while the candidate fits
const notice = computed(() => {
  if (candidate.value === undefined) return undefined;
  const limit = getHomeFurnishingLimit([...areaPlacements.value, candidate.value], area, itemIdFurnishingMap.value);
  if (limit === HomeFurnishingLimit.Count) return gameText[GameTextKey.RetHomeFurnitureArrangeLimit];
  if (limit === HomeFurnishingLimit.Load) return gameText[GameTextKey.RetHomeFurnitureExceedLimit];
  return undefined;
});
const loadRatio = computed(() => Math.min(shownLoad.value / area.loadLimit, 1));
const loadState = computed(() => computeHomeLoadState(shownLoad.value, area));
</script>

<template>
  <GameScreen>
    <ul>
      <li v-for="{ itemId, name } in held" :key="itemId">
        <GameButton
          :aria-pressed="selectedItemId === itemId"
          :kind="GameButtonKind.Row"
          @click="selectedItemId = itemId"
        >
          {{ name }}
        </GameButton>
      </li>
    </ul>
    <div :data-load-state="loadState">
      <ProgressBar :progress="loadRatio" />
    </div>
    <p v-if="notice" role="status">{{ notice }}</p>
    <GameButton
      :disabled="placeable === undefined"
      :kind="GameButtonKind.Pill"
      @click="placeable && emit('place', placeable)"
    >
      {{ gameText[GameTextKey.HomeDeploy] }}
    </GameButton>
  </GameScreen>
</template>
