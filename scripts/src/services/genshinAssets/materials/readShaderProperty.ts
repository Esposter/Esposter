import type { BinaryCursor } from "#src/models/genshinAssets/materials/BinaryCursor";
import type { ShaderProperty } from "#src/models/genshinAssets/materials/ShaderProperty";
import type { ShaderPropertyType } from "#src/models/genshinAssets/materials/ShaderPropertyType";

const PROPERTY_VALUE_BYTES = 16;

// A property of a shader's serialized form: its name, description, attributes, type, flags, default value and texture
// Defaults, of which its name, type and flags are kept
export const readShaderProperty = (cursor: BinaryCursor): ShaderProperty => {
  const name = cursor.string();
  cursor.string();
  cursor.list(() => cursor.string());
  // oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- the code is stored as the file holds it, since ShaderPropertyType lists only the codes the tooling has read and a throw here would abort every material in the bank
  const type: ShaderPropertyType = cursor.int32();
  const flags = cursor.uint32();
  cursor.skip(PROPERTY_VALUE_BYTES);
  cursor.string();
  cursor.int32();
  return { flags, name, type };
};
