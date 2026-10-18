import type { GrassRing } from "#src/models/vegetation/GrassRing";
import type { GroundCapture } from "#src/models/vegetation/GroundCapture";
import type { WaterUniforms } from "#src/models/water/WaterUniforms";
import type { Vector2 } from "three";
import type { Node, UniformNode } from "three/webgpu";

export interface GrassCellOptions {
  // The camera's position across the ground, which the ring is centred on and fades by
  cameraGround: UniformNode<"vec2", Vector2>;
  // The share of blades grown, which a quality tier lowers first
  density: UniformNode<"float", number>;
  groundCapture: GroundCapture;
  // The cell's index in the ring's grid, row by row
  index: Node<"float">;
  ring: GrassRing;
  waterUniforms: Pick<WaterUniforms, "level">;
}
