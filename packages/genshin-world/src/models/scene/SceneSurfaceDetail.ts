import type { SurfaceDetail } from "genshin-engine";
import type { UniformNode } from "three/webgpu";

// A material's surface detail as a scene holds it: the detail's targets as the scene was built with them, the uniform
// Of each octave's amplitude in the order `computeSurfaceOctaves` gives them, and the family of parts the material
// Draws, so A tool reads a family's grain and sets its amplitudes on the live scene
export interface SceneSurfaceDetail {
  amplitudes: UniformNode<"float">[];
  detail: SurfaceDetail;
  family: string;
}
