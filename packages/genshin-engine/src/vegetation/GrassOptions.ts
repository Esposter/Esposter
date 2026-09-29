import type { GrassRing } from "#src/vegetation/GrassRing";
import type { GroundCapture } from "#src/vegetation/GroundCapture";
import type { LightUniforms } from "#src/nodes/LightUniforms";
import type { WaterUniforms } from "#src/water/WaterUniforms";
import type { WindUniforms } from "#src/wind/WindUniforms";
import type { DataTexture, Vector2 } from "three";
import type { UniformNode } from "three/webgpu";

export interface GrassOptions {
  // A near-ring blade's height and root width, in metres
  bladeHeight: number;
  bladeWidth: number;
  // The camera's position across the ground, in world coordinates, which the ring is centred on and fades by
  cameraGround: UniformNode<"vec2", Vector2>;
  // The share of blades grown, which a quality tier lowers first
  density: UniformNode<"float", number>;
  groundCapture: GroundCapture;
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
  ring: GrassRing;
  waterUniforms: Pick<WaterUniforms, "level">;
  windUniforms: WindUniforms;
}
