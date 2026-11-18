import type { SerializedShaderState } from "#src/models/genshinAssets/materials/SerializedShaderState";

// A pass of a listed shader, with the render state it sets and none of its programs' code
export interface ShaderListingPass {
  name: string;
  state: SerializedShaderState;
}
