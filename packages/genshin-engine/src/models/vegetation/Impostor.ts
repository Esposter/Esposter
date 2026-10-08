import type { RenderTarget } from "three/webgpu";

// A mesh baked once from its side into two textures, its colour and its normal as the baking camera saw them, the
// Normal's components taken from minus one to one into none to one, each with its coverage in alpha. The card it is
// Drawn on is as wide as the mesh reaches from its upright axis to either side and stands from the mesh's lowest point
// To its highest, in metres
export interface Impostor {
  albedoTarget: RenderTarget;
  bottom: number;
  height: number;
  normalTarget: RenderTarget;
  width: number;
}
