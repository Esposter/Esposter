import type { DataTexture, Vector2 } from "three";
import type { UniformNode } from "three/webgpu";

// The grass trail, the bend each texel of a square round the character records as it is passed through. The square is
// toroidal: a texel holds the one world cell its index names, so the square moves with the character by reusing the
// texels it leaves behind. The bends are in ground coordinates, and the texture carries them encoded in two bytes
export interface GrassTrail {
  // The square's centre in world coordinates, which the grass fades the trail out past
  center: UniformNode<"vec2", Vector2>;
  // Each texel's bend, two numbers each in [-1, 1], which the texture encodes
  bends: Float32Array;
  // The world cell each texel holds, two integers each, which a texel not yet assigned holds as not a number
  cells: Float64Array;
  // The encoded bends, four bytes a texel, the texture's own data
  data: Uint8Array;
  texture: DataTexture;
}
