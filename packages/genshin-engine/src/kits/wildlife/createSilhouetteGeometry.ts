import type { SilhouetteSize } from "#src/models/kits/wildlife/SilhouetteSize";
import type { BufferGeometry } from "three";

import { createBoxesGeometry } from "#src/kits/architecture/createBoxesGeometry";
import { SILHOUETTE_BODY_HEIGHT_SHARE, SILHOUETTE_HEAD_WIDTH_SHARE } from "#src/kits/wildlife/constants";

// A fleeing animal's silhouette as a body and a head at the front of its depth, sized from its fitted bounds and standing
// On the origin. The head faces +z, the way an animal's heading turns it
export const createSilhouetteGeometry = ({ depth, height, width }: SilhouetteSize): BufferGeometry => {
  const bodyTop = height * SILHOUETTE_BODY_HEIGHT_SHARE;
  const headHalfWidth = (width * SILHOUETTE_HEAD_WIDTH_SHARE) / 2;
  return createBoxesGeometry([
    [-width / 2, 0, -depth / 2, width / 2, bodyTop, depth / 2],
    [-headHalfWidth, bodyTop, 0, headHalfWidth, height, depth / 2],
  ]);
};
