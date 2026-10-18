import type { GrassRing } from "#src/models/vegetation/GrassRing";
import type { GrassTrail } from "#src/models/vegetation/GrassTrail";
import type { GroundCapture } from "#src/models/vegetation/GroundCapture";
import type { WaterUniforms } from "#src/models/water/WaterUniforms";
import type { WindUniforms } from "#src/models/wind/WindUniforms";
import type { Matrix4, Vector2 } from "three";
import type { UniformNode } from "three/webgpu";

export interface GrassCullingOptions {
  // A near-ring blade's height, in metres
  bladeHeight: number;
  cameraGround: UniformNode<"vec2", Vector2>;
  // The model-to-clip matrix of the ring's mesh, which the view's frustum is tested in
  clipFromModel: UniformNode<"mat4", Matrix4>;
  density: UniformNode<"float", number>;
  groundCapture: GroundCapture;
  // The bends the character leaves as it walks, which a blade's tip is bent by as the draw bends it
  grassTrail: GrassTrail;
  ring: GrassRing;
  // The blades' segments a side, which fix the blade's index count the draw takes
  segmentCount: number;
  waterUniforms: Pick<WaterUniforms, "level">;
  // The wind a blade's tip is bent by, the same wind the draw reads
  windUniforms: WindUniforms;
}
