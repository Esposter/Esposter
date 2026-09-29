import type { LightUniforms } from "#src/nodes/LightUniforms";
import type { ColorRepresentation, DataTexture } from "three";

export interface ToonMaterialOptions {
  color?: ColorRepresentation;
  isVertexColors?: boolean;
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
}
