import type { LightUniforms } from "#src/models/nodes/LightUniforms";
import type { SurfaceDetail } from "#src/models/nodes/SurfaceDetail";
import type { ColorRepresentation, DataTexture } from "three";
import type { Node } from "three/webgpu";

export interface ToonMaterialOptions {
  color?: ColorRepresentation;
  // The procedural detail the colour is modulated by, where the export's surface carries one
  detail?: SurfaceDetail;
  // The colour and detail each mesh carries (`setObjectSurface`) in place of `color` and `detail`, so every part that
  // Differs only in its surface shares the one material
  isObjectSurface?: boolean;
  // False for ground, which the game draws no outline around, and for an instanced mesh, whose outline the pass would
  // Draw from the geometry's own place
  isOutlined?: boolean;
  // The matrix each vertex is placed by, for a mesh drawn once for all its instances from a storage buffer
  instanceMatrix?: Node<"mat4">;
  isVertexColors?: boolean;
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
}
