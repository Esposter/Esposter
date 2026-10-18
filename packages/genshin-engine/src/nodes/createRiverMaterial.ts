import type { SkyUniforms } from "#src/models/atmosphere/SkyUniforms";
import type { LightUniforms } from "#src/models/nodes/LightUniforms";
import type { WaterUniforms } from "#src/models/water/WaterUniforms";

import { createWaterMaterial } from "#src/nodes/createWaterMaterial";
import { RIVER_BEND_FOAM_ATTRIBUTE } from "#src/water/constants";
import { createWaterFlowUniforms } from "#src/water/createWaterFlowUniforms";
import { attribute } from "three/tsl";
import type { MeshBasicNodeMaterial } from "three/webgpu";

// A river's ribbon in the water material, which reads the bend foam `createRiverGeometry` writes per vertex. A river has
// No flow yet: its direction and speed are read off the game's water material or a recording, so it draws still until then
export const createRiverMaterial = (
  lightUniforms: LightUniforms,
  skyUniforms: SkyUniforms,
  waterUniforms: WaterUniforms,
): MeshBasicNodeMaterial =>
  createWaterMaterial(
    lightUniforms,
    skyUniforms,
    waterUniforms,
    createWaterFlowUniforms(),
    attribute(RIVER_BEND_FOAM_ATTRIBUTE, "float"),
  );
