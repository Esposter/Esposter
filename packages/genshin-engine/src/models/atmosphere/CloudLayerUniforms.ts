import type { Vector2, Vector3 } from "three";
import type { TextureNode, UniformNode } from "three/webgpu";

// What a sky's cloud layer draws with beside the sky's own cloud colours and coverage, as the game's cloud layer
// Reads its environment's settings: its textures, swapped by setting a node's value; how opaque it is and how soft its
// Edge, between two softnesses the weather's third channel blends; how high it stands, which bends its plane toward the
// Horizon, how many times its density tiles and the way it is turned; how far its clouds and its wisps have drifted;
// How much of the sky its wisps cover and how strongly they show; the weather over it, its density, its curl's reach
// And its softness as three shares; its curl's tiling, speed and reach; how steeply its normal map tilts; and the
// Sun's brightness and rim over its edges, with the light it is shaded by; and its dome, as the profiles' texture
// Over the elevation, the middle of the density's plane, the projections' turn and the wisps', in radians
export interface CloudLayerUniforms {
  center: UniformNode<"vec2", Vector2>;
  curl: TextureNode;
  curlAmplitude: UniformNode<"float", number>;
  curlSpeed: UniformNode<"float", number>;
  curlTiling: UniformNode<"float", number>;
  density: TextureNode;
  direction: UniformNode<"vec2", Vector2>;
  elapsedTime: UniformNode<"float", number>;
  height: UniformNode<"float", number>;
  lightDirection: UniformNode<"vec3", Vector3>;
  normal: TextureNode;
  normalYScale: UniformNode<"float", number>;
  opacity: UniformNode<"float", number>;
  profile: TextureNode;
  smoothness: UniformNode<"vec2", Vector2>;
  sunBrightness: UniformNode<"float", number>;
  sunRimLightRadius: UniformNode<"float", number>;
  tiling: UniformNode<"float", number>;
  turn: UniformNode<"float", number>;
  weather: UniformNode<"vec3", Vector3>;
  wisps: TextureNode;
  wispsCoverage: UniformNode<"float", number>;
  wispsElapsedTime: UniformNode<"float", number>;
  wispsOpacity: UniformNode<"float", number>;
  wispsTurn: UniformNode<"float", number>;
}
