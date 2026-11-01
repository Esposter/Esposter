import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";
import type { DecodedClip } from "#src/models/genshinAssets/shared/DecodedClip";

import { WALKWAY_MESH_REGEX } from "#src/services/genshinAssets/shared/constants";

// How far the walkway's blocks rise into place: Ani_Login_Lift's settled height on each block's own animator, a block
// Standing at unit scale in its row, so at the row's scale in the world
export const readWalkwayLift = (placements: readonly AssetPlacement[], clips: readonly DecodedClip[]): number => {
  const height = clips
    .find(({ name }) => name === "Ani_Login_Lift")
    ?.curves.find(({ component, property }) => property === "position" && component === "y")
    ?.samples.at(-1);
  const assetPlacement = placements.find(({ name }) => WALKWAY_MESH_REGEX.test(name));
  return (height ?? 0) * (assetPlacement?.scale[1] ?? 0);
};
