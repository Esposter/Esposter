import type { SerializedPass } from "#src/models/genshinAssets/materials/SerializedPass";

// One subshader of a shader, its passes in the order it draws them
export interface SerializedSubShader {
  passes: SerializedPass[];
}
