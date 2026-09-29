import type { ToonMaterialOptions } from "#src/nodes/ToonMaterialOptions";
import type { ToonNodeMaterial } from "#src/nodes/ToonNodeMaterial";
import type { TerrainOptions } from "#src/terrain/TerrainOptions";

import { createToonMaterial } from "#src/nodes/createToonMaterial";
import { attribute, cameraPosition, exp2, mix, modelWorldMatrix, positionLocal, vec4 } from "three/tsl";

// The ground's toon material, unoutlined and painted by its vertex colours, whose vertices morph onto the next
// Level's grid over the far end of their tile's range. A tile's level rides in its coarse position's fourth
// Component, which sets that range. The morph is the position node, which the shadow passes use too, so the
// Shadows fall on the ground as it is drawn
export const createTerrainMaterial = (
  { finestRange, morphShare }: Pick<TerrainOptions, "finestRange" | "morphShare">,
  toonMaterialOptions: Omit<ToonMaterialOptions, "isOutlined" | "isVertexColors">,
): ToonNodeMaterial => {
  const terrainMaterial = createToonMaterial({ ...toonMaterialOptions, isOutlined: false, isVertexColors: true });
  const coarsePosition = attribute("coarsePosition", "vec4");
  const morphEnd = exp2(coarsePosition.w).mul(finestRange);
  const morphStart = morphEnd.mul(1 - morphShare);
  const eyeDistance = modelWorldMatrix.mul(vec4(positionLocal, 1)).xyz.distance(cameraPosition);
  const morphAmount = eyeDistance.sub(morphStart).div(morphEnd.sub(morphStart)).saturate();
  terrainMaterial.positionNode = mix(positionLocal, coarsePosition.xyz, morphAmount);
  return terrainMaterial;
};
