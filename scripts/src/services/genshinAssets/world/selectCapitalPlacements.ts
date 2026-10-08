import type { WorldPlacement } from "#src/models/genshinAssets/world/WorldPlacement";
import type { GroundPoint } from "genshin-engine";

import { ARCHITECTURE_VIEW_METRES, CAPITAL_VIEW_METRES } from "#src/services/genshinAssets/world/constants";
import { isArchitectureName } from "#src/services/genshinAssets/world/isArchitectureName";

// Whether a placement stands within the square a capital is viewed across, round its place in the game's axes
const checkIsInView = ({ position: [x, , z] }: WorldPlacement, { x: centerX, z: centerZ }: GroundPoint): boolean =>
  Math.abs(x - centerX) <= CAPITAL_VIEW_METRES && Math.abs(z - centerZ) <= CAPITAL_VIEW_METRES;
// Whether a placement stands within the architecture radius of a capital's place
const checkIsInRadius = ({ position: [x, , z] }: WorldPlacement, { x: centerX, z: centerZ }: GroundPoint): boolean =>
  Math.hypot(x - centerX, z - centerZ) <= ARCHITECTURE_VIEW_METRES;
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
      (isArchitectureName(prefabNames.get(placement.prefabId) || "") && checkIsInRadius(placement, place)),
  );
