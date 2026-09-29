import type { Color } from "three";
import type { UniformNode } from "three/webgpu";

// A region's water: the height its sea and lakes lie at, its colour from the shallows to the deep and the depths
// Each is reached at, the shore's foam, the caustics on its floor, and the haze the camera sees under it
export interface WaterUniforms {
  causticStrength: UniformNode<"float", number>;
  deepColor: UniformNode<"color", Color>;
  // How deep the colour is fully the deep colour, and how deep the caustics have faded out, in metres
  deepDepth: UniformNode<"float", number>;
  foamColor: UniformNode<"color", Color>;
  // How far from a shore, as depth, the foam reaches, in metres
  foamDepth: UniformNode<"float", number>;
  level: UniformNode<"float", number>;
  shallowColor: UniformNode<"color", Color>;
  underwaterFogColor: UniformNode<"color", Color>;
  underwaterFogDensity: UniformNode<"float", number>;
}
