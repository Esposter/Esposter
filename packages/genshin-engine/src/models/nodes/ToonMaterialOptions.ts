import type { LightUniforms } from "#src/models/nodes/LightUniforms";
import type { SurfaceDetail } from "#src/models/nodes/SurfaceDetail";
import type { ColorRepresentation, DataTexture } from "three";

export interface ToonMaterialOptions {
  color?: ColorRepresentation;
  // The procedural detail the colour is modulated by, where the export's surface carries one
  detail?: SurfaceDetail;
  // False for ground, which the game draws no outline around
  isOutlined?: boolean;
  isVertexColors?: boolean;
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
}
