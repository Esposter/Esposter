import type { LightUniforms } from "#src/nodes/LightUniforms";
import type { ColorRepresentation, DataTexture } from "three";

export interface ToonMaterialOptions {
  color?: ColorRepresentation;
  // False for ground, which the game draws no outline around
  isOutlined?: boolean;
  isVertexColors?: boolean;
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
}
