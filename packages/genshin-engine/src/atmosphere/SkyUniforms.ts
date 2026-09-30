import type { Color, Vector2, Vector3 } from "three";
import type { UniformNode } from "three/webgpu";

// What the sky draws with, written from the sky state each frame: its gradient, the sun and moon, the stars, and
// The clouds, whose drift the wind will drive
export interface SkyUniforms {
  cloudCoverage: UniformNode<"float", number>;
  // How far the cloud layer has drifted, in its own units
  cloudDrift: UniformNode<"vec2", Vector2>;
  cloudLitColor: UniformNode<"color", Color>;
  cloudShadeColor: UniformNode<"color", Color>;
  // Where the zenith's colour has fully taken over from the horizon's, as the ray's height
  horizonBand: UniformNode<"float", number>;
  horizonColor: UniformNode<"color", Color>;
  lightColor: UniformNode<"color", Color>;
  moonDirection: UniformNode<"vec3", Vector3>;
  starIntensity: UniformNode<"float", number>;
  sunDirection: UniformNode<"vec3", Vector3>;
  zenithColor: UniformNode<"color", Color>;
}
