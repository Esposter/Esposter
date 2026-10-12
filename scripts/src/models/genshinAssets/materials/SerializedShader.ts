import type { SerializedSubShader } from "#src/models/genshinAssets/materials/SerializedSubShader";

// A shader as its raw export's serialized form lists it, its name and its subshaders, each program variant carrying its
// Compiled code and keyword set
export interface SerializedShader {
  name: string;
  subShaders: SerializedSubShader[];
}
