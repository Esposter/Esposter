import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GroundPieceArea } from "#src/models/genshinAssets/shared/GroundPieceArea";
import type { GroundPoint } from "genshin-engine";

import { readCapitalWorldPlace } from "#src/services/genshinAssets/world/readCapitalWorldPlace";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { toCapitalWorldPlace } from "#src/services/genshinAssets/world/toCapitalWorldPlace";

// A derived world's place in the game's axes: a capital's landmark (`readCapitalWorldPlace`), or for a sub-area the
// Centre of its outline's box, set round the origin the same way a capital's landmark is. The `subarea` is the
// Catalogue Area the component names, read once by the caller
export const readDerivedWorldPlace = async (
  component: DerivedAssetComponent,
  subarea: GroundPieceArea | undefined,
): Promise<GroundPoint> => {
  if (!subarea) return readCapitalWorldPlace(component);
  const xs = subarea.outline.map(({ x }) => x);
  const zs = subarea.outline.map(({ z }) => z);
  const centre = { x: (Math.min(...xs) + Math.max(...xs)) / 2, z: (Math.min(...zs) + Math.max(...zs)) / 2 };
  return toCapitalWorldPlace(centre, await readWorldOrigin(component));
};
