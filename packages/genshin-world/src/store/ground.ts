import type { RegionGround } from "#src/models/world/RegionGround";

import { HOME_REALM_GROUND_HEIGHT } from "#src/services/home/constants";
import { createWorldHeight } from "#src/services/world/createWorldHeight";
import { NotInitializedError } from "@esposter/shared";
import { defineStore } from "pinia";
import { computed, shallowRef } from "vue";

interface GroundSource {
  baseGrounds: readonly [RegionGround, ...RegionGround[]];
  getIsInHomeRealm: () => boolean;
  getRegionGrounds: () => readonly RegionGround[];
}

// The world's one ground, which everything in the world stands on: Windrise's with each region's laid over it from the
// Moment the region first comes within reach, and the realm's flat floor while the player is in the Serenitea Pot's realm.
// The session starts it with where the region grounds and the realm visit are read from, so the ground is built again only
// As a region's ground arrives, and stops it as it unmounts
export const useWorldGroundStore = defineStore("world/ground", () => {
  const source = shallowRef<GroundSource>();
  const getSource = () => {
    if (!source.value) throw new NotInitializedError("WorldGroundStore");
    return source.value;
  };
  const worldHeight = computed(() => {
    const { baseGrounds, getRegionGrounds } = getSource();
    return createWorldHeight(baseGrounds, getRegionGrounds());
  });
  const getGroundHeight = (x: number, z: number): number =>
    getSource().getIsInHomeRealm() ? HOME_REALM_GROUND_HEIGHT : worldHeight.value(x, z);
  const start = (nextSource: GroundSource) => {
    source.value = nextSource;
  };
  const stop = () => {
    source.value = undefined;
  };

  return { getGroundHeight, start, stop };
});
