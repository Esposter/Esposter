import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GroundPoint } from "genshin-engine";

import { readCapitalWorldPlace } from "#src/services/genshinAssets/world/readCapitalWorldPlace";
import { readSubareaArea } from "#src/services/genshinAssets/world/readSubareaArea";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { toCapitalWorldPlace } from "#src/services/genshinAssets/world/toCapitalWorldPlace";

// A derived world's place in the game's axes: a capital's landmark (`readCapitalWorldPlace`), or for a sub-area the
// Centre of its outline's box, set round the origin the same way a capital's landmark is
export const readDerivedWorldPlace = async (component: DerivedAssetComponent): Promise<GroundPoint> => {
  const subarea = await readSubareaArea(component);
  if (!subarea) return readCapitalWorldPlace(component);
  const xs = subarea.outline.map(({ x }) => x);
  const zs = subarea.outline.map(({ z }) => z);
  const centre = { x: (Math.min(...xs) + Math.max(...xs)) / 2, z: (Math.min(...zs) + Math.max(...zs)) / 2 };
  return toCapitalWorldPlace(centre, await readWorldOrigin(component));
};
