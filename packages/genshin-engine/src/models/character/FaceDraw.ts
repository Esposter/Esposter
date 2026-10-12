import type { UniformNode } from "three/webgpu";

// A face's draw, its values set once a frame on the CPU from the light's angle to the face's root bone, and the two the
// Game's own material gives beside them. The threshold is what the face map is compared against, and the flip mirrors the
// Face map's u where it reads one
export interface FaceDraw {
  // One where the face map's u is mirrored, zero where it is not
  flip: UniformNode<"float", number>;
  // The material's flip factor, "_FaceFlipFactor": past one half it forces the flip on, below minus one half off
  flipFactor: number;
  // The material's rotate offset, "_FaceMapRotateOffset", where the angle's ramp starts
  rotateOffset: number;
  // The threshold the face map's texel is compared against, "v9.z" in the game's face program
  threshold: UniformNode<"float", number>;
}
