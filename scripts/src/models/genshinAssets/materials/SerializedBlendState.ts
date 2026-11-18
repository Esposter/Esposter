import type { SerializedShaderFloat } from "#src/models/genshinAssets/materials/SerializedShaderFloat";

// A render target's blend: the source and destination factors of its colour, its operation and the channels it writes
export interface SerializedBlendState {
  colorMask: SerializedShaderFloat;
  destination: SerializedShaderFloat;
  operation: SerializedShaderFloat;
  source: SerializedShaderFloat;
}
