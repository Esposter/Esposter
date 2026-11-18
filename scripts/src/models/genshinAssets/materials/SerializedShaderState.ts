import type { SerializedBlendState } from "#src/models/genshinAssets/materials/SerializedBlendState";
import type { SerializedDepthState } from "#src/models/genshinAssets/materials/SerializedDepthState";

// A pass's render state: the blend of its first render target, and its depth values
export interface SerializedShaderState {
  blend: SerializedBlendState;
  depth: SerializedDepthState;
}
