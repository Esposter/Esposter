import type { ShaderProperty } from "#src/models/genshinAssets/materials/ShaderProperty";

import { BinaryCursor } from "#src/models/genshinAssets/materials/BinaryCursor";
import { readShaderProperty } from "#src/services/genshinAssets/materials/readShaderProperty";

// The properties a shader's raw export declares, in the order it declares them: its name, then the property table that
// Leads its serialized form. They tell a nameless shader apart (the sky's `_SkyGradientTex`, the stone's `_RGColor`),
// Name the values its programs read and say which of a material's saved colours are colours at all. The table is read
// On its own, ahead of the subshaders, so it is read from a shader whose later layout `parseSerializedShader` does not follow
export const parseShaderProperties = (data: Buffer): ShaderProperty[] => {
  const cursor = new BinaryCursor(data);
  cursor.string();
  return cursor.list(() => readShaderProperty(cursor));
};
