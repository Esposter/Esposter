import type { CloudLayerDome } from "#src/models/atmosphere/CloudLayerDome";
import type { CloudLayerUniforms } from "#src/models/atmosphere/CloudLayerUniforms";
import type { Texture } from "three";

import { createCloudLayerProfileTexture } from "#src/atmosphere/createCloudLayerProfileTexture";
import { MathUtils, Vector2, Vector3 } from "three";
import { texture, uniform } from "three/tsl";

// A cloud layer's uniforms over its dome and the textures it samples, drawing nothing until its opacity is set: its
// Weather full, its plane level with the near projection and untiled, turned along its first axis
export const createCloudLayerUniforms = (
  { center, turn, wispsTurn, ...profiles }: CloudLayerDome,
  textures: Record<"curl" | "density" | "normal" | "wisps", Texture>,
): CloudLayerUniforms => ({
  center: uniform(new Vector2().fromArray(center)),
  curl: texture(textures.curl),
  curlAmplitude: uniform(0),
  curlSpeed: uniform(0),
  curlTiling: uniform(1),
  density: texture(textures.density),
  direction: uniform(new Vector2(1, 0)),
  elapsedTime: uniform(0),
  height: uniform(0),
  lightDirection: uniform(new Vector3(0, 1, 0)),
  normal: texture(textures.normal),
  normalYScale: uniform(1),
  opacity: uniform(0),
  profile: texture(createCloudLayerProfileTexture(profiles)),
  smoothness: uniform(new Vector2()),
  sunBrightness: uniform(0),
  sunRimLightRadius: uniform(0),
  tiling: uniform(1),
  turn: uniform(MathUtils.degToRad(turn)),
  weather: uniform(new Vector3(1, 1, 0)),
  wisps: texture(textures.wisps),
  wispsCoverage: uniform(0),
  wispsElapsedTime: uniform(0),
  wispsOpacity: uniform(0),
  wispsTurn: uniform(MathUtils.degToRad(wispsTurn)),
});
