import type { SceneGroupPlace } from "genshin-world";

import { CRAFTING_KEEPER_BENCH_OFFSET_METRES } from "#src/services/genshinAssets/crafting/constants";

// The keeper's place beside the bench: the bench's own place moved along the game's x axis, turned as the bench is
export const toCraftingKeeperPlace = (benchPlace: SceneGroupPlace): SceneGroupPlace => ({
  ...benchPlace,
  position: { ...benchPlace.position, x: benchPlace.position.x + CRAFTING_KEEPER_BENCH_OFFSET_METRES },
});
