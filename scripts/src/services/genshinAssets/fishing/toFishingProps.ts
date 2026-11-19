import type { ScenePlacement } from "genshin-engine";
import type { FishingPropPlace } from "genshin-world";

import { FISHING_PROP_NAME_PATTERN } from "#src/services/genshinAssets/fishing/constants";

// The placements of a region's witness layout that are fishing-area props, each as its name, place, turn and scale
export const toFishingProps = (placements: readonly ScenePlacement[]): FishingPropPlace[] =>
  placements
    .filter(({ mesh }) => FISHING_PROP_NAME_PATTERN.test(mesh))
    .map(({ mesh, position, rotation, scale }) => ({ name: mesh, position, rotation, scale }));
