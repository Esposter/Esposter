import type { ToonMaterialOptions } from "#src/models/nodes/ToonMaterialOptions";
import type { ToonNodeMaterial } from "#src/models/nodes/ToonNodeMaterial";
import type { TerrainOptions } from "#src/models/terrain/TerrainOptions";
import type { WaterUniforms } from "#src/models/water/WaterUniforms";
import type { Vector3 } from "three";
import type { UniformNode } from "three/webgpu";

import { createCausticsNode } from "#src/nodes/createCausticsNode";
import { createRimNode } from "#src/nodes/createRimNode";
import { createToonMaterial } from "#src/nodes/createToonMaterial";
import { getTerrainMorphStart } from "#src/terrain/getTerrainMorphStart";
import {
  attribute,
  exp2,
  float,
  Fn,
  max,
  mix,
  modelWorldMatrix,
  normalLocal,
  positionGeometry,
  varying,
  vec3,
  vec4,
} from "three/tsl";

// The ground's toon material, unoutlined and painted by its vertex colours, whose vertices morph onto the next
// Level's grid over the far end of their tile's range, their normals and colours with them, so a tile switching level
// Draws the ground it was drawing: a normal left at its own level's would flip the ramp's step across a hill. A
// Tile's level rides in its coarse position's fourth component, which sets that range. A vertex's distance is
// Measured as the selection measures a tile's, the eye's height counting only past the band every tile's bounds span,
// So a tile splitting into its children is short of its morph everywhere (`getTerrainMorphStart`). The morph is the
// Position node, which the shadow passes use too, so it is measured from the view's eye rather than the camera
// Rendering: a cascade's camera moves whenever the view turns, and morphing by it would reshape the ground each
// Cascade draws, flickering its shadows across the hills. Where the region has water, the floor under it shimmers with
// Caustics
export const createTerrainMaterial = (
  terrainOptions: Pick<TerrainOptions, "finestRange" | "finestTileSize" | "maxHeight" | "minHeight">,
  // The view's eye in the scene's coordinates, written each frame by whatever selects the tiles
  eye: UniformNode<"vec3", Vector3>,
  // No colour of its own: the colour node is the morphed vertex colour, which replaces the material's
  toonMaterialOptions: Pick<ToonMaterialOptions, "lightUniforms" | "rampTexture">,
  waterUniforms?: WaterUniforms,
): ToonNodeMaterial => {
  const terrainMaterial = createToonMaterial({ ...toonMaterialOptions, isOutlined: false });
  const coarsePosition = attribute("coarsePosition", "vec4");
  const { finestRange, maxHeight, minHeight } = terrainOptions;
  const levelScale = exp2(coarsePosition.w);
  const morphEnd = levelScale.mul(finestRange);
  const morphStart = levelScale.mul(getTerrainMorphStart(terrainOptions));
  const worldPosition = modelWorldMatrix.mul(vec4(positionGeometry, 1)).xyz;
  const eyeLift = max(eye.y.sub(maxHeight), float(minHeight).sub(eye.y), 0);
  const eyeDistance = vec3(worldPosition.x.sub(eye.x), eyeLift, worldPosition.z.sub(eye.z)).length();
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
