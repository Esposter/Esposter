import type { WorldPlacement } from "#src/models/genshinAssets/world/WorldPlacement";
import type { GroundPoint } from "genshin-engine";

import { checkIsArchitectureName } from "#src/services/genshinAssets/world/checkIsArchitectureName";
import { checkIsInArchitectureView } from "#src/services/genshinAssets/world/checkIsInArchitectureView";
import { checkIsInView } from "#src/services/genshinAssets/world/checkIsInView";

// The placements a capital's open world keeps: every one in its view, and each architecture placement within the
// Architecture radius, its prefab named by `prefabNames`. Decoration past the view is left out, and so is architecture
// Past the radius
export const selectCapitalPlacements = (
  placements: readonly WorldPlacement[],
  prefabNames: ReadonlyMap<number, string>,
  place: GroundPoint,
): WorldPlacement[] =>
  placements.filter(
    (placement) =>
      checkIsInView(placement, place) ||
      (checkIsArchitectureName(prefabNames.get(placement.prefabId) || "") &&
        checkIsInArchitectureView(placement.position, place)),
  );
