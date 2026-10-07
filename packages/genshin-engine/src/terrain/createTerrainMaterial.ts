import type { ToonMaterialOptions } from "#src/models/nodes/ToonMaterialOptions";
import type { ToonNodeMaterial } from "#src/models/nodes/ToonNodeMaterial";
import type { TerrainOptions } from "#src/models/terrain/TerrainOptions";
import type { WaterUniforms } from "#src/models/water/WaterUniforms";
import type { Vector3 } from "three";
import type { UniformNode } from "three/webgpu";

import { createCausticsNode } from "#src/nodes/createCausticsNode";
import { createRimNode } from "#src/nodes/createRimNode";
import { createToonMaterial } from "#src/nodes/createToonMaterial";
import { attribute, exp2, Fn, mix, modelWorldMatrix, normalLocal, positionGeometry, varying, vec4 } from "three/tsl";

// The ground's toon material, unoutlined and painted by its vertex colours, whose vertices morph onto the next
// Level's grid over the far end of their tile's range, their normals and colours with them, so a tile switching level
// Draws the ground it was drawing: a normal left at its own level's would flip the ramp's step across a hill. A
// Tile's level rides in its coarse position's fourth component, which sets that range. The morph is the position
// Node, which the shadow passes use too, so it is measured from the view's eye rather than the camera rendering: a
// Cascade's camera moves whenever the view turns, and morphing by it would reshape the ground each cascade draws,
// Flickering its shadows across the hills. Where the region has water, the floor under it shimmers with caustics
export const createTerrainMaterial = (
  { finestRange, morphShare }: Pick<TerrainOptions, "finestRange" | "morphShare">,
  // The view's eye in the scene's coordinates, written each frame by whatever selects the tiles
  eye: UniformNode<"vec3", Vector3>,
  toonMaterialOptions: Pick<ToonMaterialOptions, "color" | "lightUniforms" | "rampTexture">,
  waterUniforms?: WaterUniforms,
): ToonNodeMaterial => {
  const terrainMaterial = createToonMaterial({ ...toonMaterialOptions, isOutlined: false });
  const coarsePosition = attribute("coarsePosition", "vec4");
  const morphEnd = exp2(coarsePosition.w).mul(finestRange);
  const morphStart = morphEnd.mul(1 - morphShare);
  const eyeDistance = modelWorldMatrix.mul(vec4(positionGeometry, 1)).xyz.distance(eye);
  const morphAmount = eyeDistance.sub(morphStart).div(morphEnd.sub(morphStart)).saturate();
  terrainMaterial.positionNode = Fn(() => {
    normalLocal.assign(mix(normalLocal, attribute("coarseNormal", "vec3"), morphAmount).normalize());
    return mix(positionGeometry, coarsePosition.xyz, morphAmount);
  })();
  terrainMaterial.colorNode = vec4(
    varying(mix(attribute("color", "vec3"), attribute("coarseColor", "vec3"), morphAmount)),
    1,
  );
  if (waterUniforms) {
    const { lightUniforms } = toonMaterialOptions;
    terrainMaterial.emissiveNode = createRimNode(lightUniforms).add(createCausticsNode(lightUniforms, waterUniforms));
  }
  return terrainMaterial;
};
