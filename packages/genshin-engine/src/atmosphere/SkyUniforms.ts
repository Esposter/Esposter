import type { Color, Vector2, Vector3 } from "three";
import type { UniformNode } from "three/webgpu";

// What the sky draws with, written from the sky state each frame, as the game's sky shader reads its own: the top
// And bottom colours toward the sun and away from it, blended by how far toward it a ray looks; the bottom colour's
// Reach and the horizon halo's up the sky's gradient; the sun's halo and the moon's glow; the stars; and the clouds,
// Whose drift the wind will drive
export interface SkyUniforms {
  cloudCoverage: UniformNode<"float", number>;
  // How far the cloud layer has drifted, in its own units
  cloudDrift: UniformNode<"vec2", Vector2>;
  // A cloud's lit and shaded colours toward the sun and away from it, how sharply the one gives way to the other, and
  // How much brighter a cloud looks the further toward the sun it stands
  cloudFrontBackBlend: UniformNode<"float", number>;
  cloudLitBackColor: UniformNode<"color", Color>;
  cloudLitColor: UniformNode<"color", Color>;
  cloudShadeBackColor: UniformNode<"color", Color>;
  cloudShadeColor: UniformNode<"color", Color>;
  cloudSunBrighten: UniformNode<"float", number>;
  // How sharply the colours toward the sun give way to those away from it: 0 keeps the front alone, 1 blends across
  // The whole sky
  frontBackBlend: UniformNode<"float", number>;
  // The horizon halo, its colour at its strength, and how far up the gradient it reaches
  haloColor: UniformNode<"color", Color>;
  haloHeight: UniformNode<"float", number>;
  // How far up the sky the gradient carries the bottom colour, as a share of the way to the zenith
  horizonBand: UniformNode<"float", number>;
  // The bottom colour away from the sun and toward it
  horizonBackColor: UniformNode<"color", Color>;
  horizonColor: UniformNode<"color", Color>;
  lightColor: UniformNode<"color", Color>;
  moonDirection: UniformNode<"vec3", Vector3>;
  // The moon's glow, its colour at its strength and phase, and its size
  moonGlowColor: UniformNode<"color", Color>;
  moonSize: UniformNode<"float", number>;
  starIntensity: UniformNode<"float", number>;
  sunDirection: UniformNode<"vec3", Vector3>;
  // The sun's halo, its colour at its strength, and how tight it draws toward the zenith
  sunHaloColor: UniformNode<"color", Color>;
  sunHaloSize: UniformNode<"float", number>;
  // The top colour away from the sun and toward it
  zenithBackColor: UniformNode<"color", Color>;
  zenithColor: UniformNode<"color", Color>;
}
