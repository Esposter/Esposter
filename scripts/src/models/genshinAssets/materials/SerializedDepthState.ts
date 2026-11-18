import type { SerializedShaderFloat } from "#src/models/genshinAssets/materials/SerializedShaderFloat";

// A pass's depth values: its depth test, whether it writes depth, and the face it culls
export interface SerializedDepthState {
  cull: SerializedShaderFloat;
  zTest: SerializedShaderFloat;
  zWrite: SerializedShaderFloat;
}
