import type { GatheringItem } from "#src/models/gathering/GatheringItem";
import type { GatheringPlace } from "#src/models/gathering/GatheringPlace";

import { readGatheringItems } from "#src/services/gathering/readGatheringItems";
import { readMondstadtGatheringPlaces } from "#src/services/gathering/readMondstadtGatheringPlaces";
import { getResultAsync } from "@esposter/shared";
import { shallowRef } from "vue";

// Mondstadt's gathering points and the items they give, read as the world opens: both slices are imported on demand, and
// A load that fails is logged and left off, so no point is offered rather than a wrong one
export const useGatheringPoints = () => {
  const gatheringItems = shallowRef<GatheringItem[]>([]);
  const gatheringPlaces = shallowRef<GatheringPlace[]>([]);
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => Promise.all([readMondstadtGatheringPlaces(), readGatheringItems()])).match(
    ([places, items]) => {
      gatheringItems.value = items;
      gatheringPlaces.value = places;
    },
    (error) => {
      console.error(error);
    },
  );
  return { gatheringItems, gatheringPlaces };
};
